import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import apiService from './ApiService';
import realTimeSyncService from './RealTimeSyncService';
import { getDatabaseService, setSyncServiceCallbacks } from './ServiceInterfaces';

export interface SyncItem {
  id: string;
  type: 'bottle' | 'poop' | 'group';
  action: 'create' | 'update' | 'delete' | 'add'; // 🔥 NEW: Added 'add' action
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  pendingItems: number;
  error: string | null;
}



class SyncService {
  private static instance: SyncService;
  private syncQueue: SyncItem[] = [];
  private syncStatus: SyncStatus = {
    isOnline: false,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    error: null,
  };

  private listeners: ((status: SyncStatus) => void)[] = [];
  private netInfoUnsubscribe: (() => void) | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  
  // 🔥 NEW: Persistent device ID for this session
  private sessionDeviceId: string | null = null;

  private constructor() {
    this.initializeSync();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Initialiser le service de synchronisation
  private async initializeSync(): Promise<void> {
    // NEW: Toujours configurer les callbacks en premier
    setSyncServiceCallbacks({
      isOnline: () => this.syncStatus.isOnline || false,
      addToSyncQueue: (item: any) => {
        return this.addToSyncQueue(item);
      },
      sync: () => {
        if (!this.syncStatus.isOnline) {
          return Promise.resolve();
        }
        return this.sync();
      },
      initializeAfterAuth: () => this.initializeAfterAuth(),
    });
    
    // ✅ First check if we have an authentication token
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) {
      return; // Don't initialize sync without authentication
    }
    
    // Load sync queue from AsyncStorage
    await this.loadSyncQueue();
    
    // 🔥 REMOVED: Callbacks already configured above
    
    // 🔥 NEW: Listen to real-time data changes
    this.setupEventListeners();
    
    // 🔥 NEW: Initialize real-time sync service ONLY if authenticated
    await this.initializeRealTimeSync();
    
    // Listen to connectivity changes
    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = this.syncStatus.isOnline;
      this.syncStatus.isOnline = state.isConnected ?? false;
      
      // If we just reconnected, sync
      if (!wasOnline && this.syncStatus.isOnline) {
        this.sync();
        // 🔥 REMOVED: No more duplicate initialization
        // this.initializeRealTimeSync();
      }
      
      this.notifyListeners();
    });

    // Check initial connectivity
    const netInfo = await NetInfo.fetch();
    this.syncStatus.isOnline = netInfo.isConnected ?? false;
    this.notifyListeners();

    // 🔥 CRITICAL FIX: If we're already online at startup and have pending items, sync them
    if (this.syncStatus.isOnline && this.syncQueue.length > 0) {
      console.log(`🔄 [SYNC] Starting sync for ${this.syncQueue.length} pending items at startup`);
      this.sync();
    }

    // 🔥 NEW: Remove periodic sync - now using real-time events
    // this.startPeriodicSync();
  }

  // Add an item to the sync queue
  async addToSyncQueue(item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncItem: SyncItem = {
      ...item,
      id: `${item.type}_${item.action}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(syncItem);
    this.syncStatus.pendingItems = this.syncQueue.length;
    
    await this.saveSyncQueue();
    this.notifyListeners();

    // If we're online, sync immediately
    if (this.syncStatus.isOnline) {
      this.sync();
    }
  }

  // Synchroniser avec le backend
  async sync(): Promise<void> {
    if (this.syncStatus.isSyncing || !this.syncStatus.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.notifyListeners();

    try {
      const itemsToSync = [...this.syncQueue];
      const successfulItems: string[] = [];

      for (const item of itemsToSync) {
        try {
          await this.processSyncItem(item);
          successfulItems.push(item.id);
        } catch (error) {
          item.retryCount++;
          
          // Remove after 3 failed attempts
          if (item.retryCount >= 3) {
            successfulItems.push(item.id); // Remove from queue
          }
        }
      }

      // Remove successfully synced items
      this.syncQueue = this.syncQueue.filter(item => !successfulItems.includes(item.id));
      this.syncStatus.pendingItems = this.syncQueue.length;
      this.syncStatus.lastSync = Date.now();
      
      await this.saveSyncQueue();
      this.notifyListeners();

    } catch (error) {
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.notifyListeners();
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Process a sync item
  private async processSyncItem(item: SyncItem): Promise<void> {
    switch (item.type) {
      case 'bottle':
        await this.processBottleSync(item);
        break;
      case 'poop':
        await this.processPoopSync(item);
        break;
      case 'group':
        await this.processGroupSync(item);
        break;
      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  // Traiter la synchronisation d'une bouteille
  private async processBottleSync(item: SyncItem): Promise<void> {
    try {
      switch (item.action) {
        case 'add':
        case 'create':
          const createdBottle = await apiService.createBottle(item.data);
          break;
        case 'update':
          try {
            await apiService.updateBottle(item.data.id, {
              amount: item.data.amount,
              time: item.data.time,
              color: item.data.color,
            });
          } catch (error: any) {
            // CRITICAL FIX: Handle 404 errors for update operations
            if (error.response?.status === 404) {
                        // Try to create the bottle instead
          await apiService.createBottle({
              id: item.data.id,
            amount: item.data.amount,
            time: item.data.time,
            color: item.data.color,
          });
              return;
            }
            throw error;
          }
          break;
        case 'delete':
          try {
            await apiService.deleteBottle(item.data.id);
            // ✅ Bottle deleted successfully - no need to track with unified system
          } catch (error: any) {
            // CRITICAL FIX: Handle 404 errors gracefully for delete operations
            if (error.response?.status === 404) {
              return;
            }
            // Re-throw other errors
            throw error;
          }
          break;
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the caller
    }
  }

  // Traiter la synchronisation d'un caca
  private async processPoopSync(item: SyncItem): Promise<void> {
    try {
      switch (item.action) {
        case 'add':
        case 'create':
          try {
            const createdPoop = await apiService.createPoop(item.data);
            
            // ✅ Poop created successfully - no need to link IDs with unified system
          } catch (error: any) {
            // CRITICAL FIX: Handle 404 error when poop API is not available
            if (error.response?.status === 404) {
              return; // Skip this sync item
            }
            throw error;
          }
          break;
        case 'update':
          try {
            await apiService.updatePoop(item.data.id, {
              time: item.data.time,
              info: item.data.info,
              color: item.data.color,
            });
          } catch (error: any) {
            // 🔥 CRITICAL FIX: Handle 404 errors for update operations
            if (error.response?.status === 404) {
              console.log(`🔄 [SYNC] Poop ${item.data.id} not found on server, creating instead`);
              // Try to create the poop instead
              try {
                await apiService.createPoop({
                  id: item.data.id,
                  time: item.data.time,
                  info: item.data.info,
                  color: item.data.color,
                });
              } catch (createError: any) {
                if (createError.response?.status === 404) {
                  console.log('⚠️ [SYNC] Poop API not available on server, skipping poop update');
                  return; // Skip this sync item
                }
                throw createError;
              }
              return;
            }
            throw error;
          }
          break;
        case 'delete':
          try {
            await apiService.deletePoop(item.data.id);
            // ✅ Poop deleted successfully - no need to track with unified system
          } catch (error: any) {
            // 🔥 CRITICAL FIX: Handle 404 errors gracefully for delete operations
            if (error.response?.status === 404) {
              console.log(`🔄 [SYNC] Poop ${item.data.id} already deleted on server, skipping delete operation`);
              return;
            }
            // Re-throw other errors
            throw error;
          }
          break;
      }
    } catch (error) {
      console.error(`Error syncing item ${item.id}:`, error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  // Traiter la synchronisation d'un groupe - SUPPRIMÉ
  private async processGroupSync(item: SyncItem): Promise<void> {
    // 🔥 SUPPRIMÉ: Group functionality removed
    console.log('Group sync removed - no longer supported');
  }

  // Sync data from backend to SQLite
  async syncFromBackend(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      return;
    }

    try {
      // Get user bottles (last 20 bottles)
      const { bottles } = await apiService.getBottles(20);
      
      // Sync bottles
      for (const bottle of bottles) {
        await getDatabaseService()?.addBottle(
          bottle.amount,
          new Date(bottle.time),
          bottle.color
        );
      }

      this.syncStatus.lastSync = Date.now();
      this.notifyListeners();
    } catch (error) {
      console.error('Error syncing from backend:', error);
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.notifyListeners();
    }
  }

  // Charger la file d'attente depuis AsyncStorage
  private async loadSyncQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem('syncQueue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
        this.syncStatus.pendingItems = this.syncQueue.length;
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  // Sauvegarder la file d'attente dans AsyncStorage
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  // Obtenir le statut de synchronisation
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Check if we're online
  isOnline(): boolean {
    return this.syncStatus.isOnline;
  }

  // Check if synchronization is in progress
  isSyncing(): boolean {
    return this.syncStatus.isSyncing;
  }

  // ✅ Initialize sync after authentication
  async initializeAfterAuth(): Promise<void> {
    console.log('🔐 [SYNC] Initializing sync after authentication...');
    await this.initializeSync();
  }

  // ✅ Check if sync is initialized
  isInitialized(): boolean {
    return this.syncStatus.isOnline || this.syncStatus.lastSync !== null;
  }

  // Get number of pending items
  getPendingItemsCount(): number {
    return this.syncStatus.pendingItems;
  }

  // 🔥 NEW: Clear sync queue (useful for debugging or resetting sync state)
  async clearSyncQueue(): Promise<void> {
    console.log('🧹 [SYNC] Clearing sync queue...');
    this.syncQueue = [];
    this.syncStatus.pendingItems = 0;
    await this.saveSyncQueue();
    this.notifyListeners();
    console.log('✅ [SYNC] Sync queue cleared');
  }

  // 🔥 NEW: Reset message listener flag (for debugging)
  resetMessageListener(): void {
    console.log('🔄 [SYNC] Resetting message listener flag...');
    this.messageListenerAdded = false;
  }

  // 🔥 NEW: Get sync queue for debugging
  getSyncQueue(): SyncItem[] {
    return [...this.syncQueue];
  }

  // 🔥 REMOVED: markDeletedItemSynced method - no longer needed with unified ID system

  // 🔥 NEW: Setup real-time event listeners
  private setupEventListeners(): void {
    // 🔥 REMOVED: No more local event listening - rely only on WebSocket messages
    // This prevents loops between local events and WebSocket messages
  }

  // 🔥 NEW: Flag to track if message listener is already added
  private messageListenerAdded = false;

  // 🔥 NEW: Flag to track last sync request for debouncing
  private lastSyncRequest = 0;

  // 🔥 NEW: Initialize real-time sync service
  private async initializeRealTimeSync(): Promise<void> {
    try {
      console.log('🚀 [SYNC] Initializing real-time sync service...');
      
      await realTimeSyncService.initialize();
      
      // Listen to real-time sync status changes
      realTimeSyncService.addStatusListener((status) => {
        if (status.error) {
          console.log('❌ [REAL-TIME] Error:', status.error);
          this.syncStatus.error = status.error;
          this.notifyListeners();
        }
      });

      // 🔥 CRITICAL FIX: Add message listener only once (prevent duplicates)
      if (!this.messageListenerAdded) {
      console.log('🔥 [DEBUG] Adding message listener to real-time sync service');
      realTimeSyncService.addMessageListener((message) => {
        console.log('🔥 [DEBUG] Message listener called for message type:', message.type);
        this.handleRealTimeMessage(message);
      });
        this.messageListenerAdded = true;
        console.log('✅ [SYNC] Message listener added successfully');
      } else {
        console.log('🔥 [DEBUG] Message listener already exists, skipping...');
      }
      
      console.log('✅ [SYNC] Real-time sync service initialized');
    } catch (error) {
      console.error('❌ [SYNC] Failed to initialize real-time sync service:', error);
    }
  }

  // 🔥 NEW: Handle incoming real-time messages
  private async handleRealTimeMessage(message: any): Promise<void> {
    console.log('🔥 [DEBUG] ===== REAL-TIME MESSAGE HANDLER START =====');
    console.log('🔥 [DEBUG] Message type:', message.type);
    console.log('🔥 [DEBUG] Message device ID:', message.deviceId);
    console.log('🔥 [DEBUG] Full message:', JSON.stringify(message, null, 2));
    
    try {
      // Get current user to avoid processing own messages
      const currentUser = await apiService.getProfile();
      
      // 🔥 FIXED: Check if message is from same device to prevent loops
      const currentDeviceId = await this.getCurrentDeviceId();
      console.log('🔥 [DEBUG] Current device ID:', currentDeviceId);
      console.log('🔥 [DEBUG] Device IDs match?', currentDeviceId === message.deviceId);
      
      if (message.deviceId === currentDeviceId) {
        console.log('🔥 [DEBUG] Ignoring message from same device');
        console.log('🔥 [DEBUG] ===== REAL-TIME MESSAGE HANDLER END (IGNORED) =====');
        return;
      }

      console.log('🔥 [DEBUG] Processing message from different device');

      // Handle different message types
      switch (message.type) {
        case 'CONNECTED':
          await this.handleDeviceConnected(message);
          break;
        case 'SYNC_REQUESTED':
          await this.handleSyncRequested(message);
          break;
        case 'GROUP_UPDATED':
          await this.handleRemoteGroupUpdated(message);
          break;
        case 'SETTINGS_CHANGED':
          await this.handleRemoteSettingsChanged(message);
          break;
        case 'DATA_CLEARED':
          await this.handleRemoteDataCleared(message);
          break;
        default:
          console.log('🔥 [DEBUG] Unknown message type:', message.type);
      }
      
      console.log('🔥 [DEBUG] ===== REAL-TIME MESSAGE HANDLER END =====');
    } catch (error) {
      console.error('❌ [REAL-TIME] Error handling message:', error);
    }
  }

  // 🔥 NEW: Get current device ID
  private async getCurrentDeviceId(): Promise<string> {
    try {
      // 🔥 CRITICAL FIX: Use persistent device ID for this session
      if (!this.sessionDeviceId) {
        // 🔥 FIXED: Try to get existing device ID from storage first
        const existingDeviceId = await AsyncStorage.getItem('sessionDeviceId');
        
        if (existingDeviceId) {
          this.sessionDeviceId = existingDeviceId;
          console.log('🔥 [DEBUG] Reusing existing session device ID:', this.sessionDeviceId);
        } else {
          // 🔥 FIXED: Generate device ID only once and store it
          this.sessionDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem('sessionDeviceId', this.sessionDeviceId);
          console.log('🔥 [DEBUG] Generated new session device ID:', this.sessionDeviceId);
        }
      }
      console.log('🔥 [DEBUG] Returning session device ID:', this.sessionDeviceId);
      return this.sessionDeviceId;
    } catch (error) {
      console.error('❌ [REAL-TIME] Error getting device ID:', error);
      return `device_${Date.now()}_fallback`;
    }
  }

  // 🔥 NEW: Handle CONNECTED message - trigger sync when another device connects
  private async handleDeviceConnected(message: any): Promise<void> {
    console.log('🔗 [CONNECTED] Another device connected, triggering sync...');
    
    // Trigger a sync to get latest data from the newly connected device
    const databaseService = getDatabaseService();
    await databaseService.syncFromCloud();
    
    // 🔥 FIXED: No need to emit event - syncFromCloud() already does it
    console.log('✅ [CONNECTED] Sync completed after device connection');
  }

  // 🔥 NEW: Handle SYNC_REQUESTED message with debouncing
  private async handleSyncRequested(message: any): Promise<void> {
    console.log('🔄 [SYNC] Sync requested from other device');
    
    const now = Date.now();
    // if (now - this.lastSyncRequest < 5000) { // 5 secondes
    //   console.log('🔄 [SYNC] Sync already requested recently, skipping...');
    //   return;
    // }
    
    this.lastSyncRequest = now;
    const databaseService = getDatabaseService();
    if (databaseService) {
      console.log('🔄 [SYNC] Starting optimized sync from cloud...');
      await databaseService.syncFromCloud();
      // 🔥 FIXED: No need to emit event - syncFromCloud() already does it
      console.log('🔄 [SYNC] Sync completed, UI will update automatically');
    }
  }

  // 🔥 NEW: Handle remote bottle updated
  private async handleRemoteBottleUpdated(message: any): Promise<void> {
    console.log('🔄 [REAL-TIME] Handling remote bottle updated');
    console.log('🔄 [REAL-TIME] Message received:', JSON.stringify(message, null, 2));
    console.log('🔄 [REAL-TIME] Current device ID:', await this.getCurrentDeviceId());
    console.log('🔄 [REAL-TIME] Message device ID:', message.deviceId);
    console.log('🔄 [REAL-TIME] Device IDs match?', await this.getCurrentDeviceId() === message.deviceId);
    
    const databaseService = getDatabaseService();
    if (databaseService) {
      console.log('🔄 [DEBUG] Calling databaseService.updateBottle with sendWebSocketMessage: false');
      
      // Find local bottle by unified ID and update it
      const localBottle = await databaseService.findBottleById(message.data.id);
      
      if (localBottle) {
        console.log('🔄 [REAL-TIME] Updating local bottle', localBottle.id);
        
        // Update bottle locally without sending WebSocket message
        await databaseService.updateBottle(
          localBottle.id,
          message.data.amount,
          new Date(message.data.time),
          message.data.color,
          false // Don't send WebSocket message
        );
      } else {
        console.log('⚠️ [REAL-TIME] Could not find local bottle with ID', message.data.id);
      }
    } else {
      console.log('🔄 [DEBUG] Database service not available');
    }
    console.log('🔄 [DEBUG] ===== REMOTE BOTTLE UPDATED END =====');
  }

  // 🔥 NEW: Handle remote bottle deleted
  private async handleRemoteBottleDeleted(message: any): Promise<void> {
    console.log('🗑️ [REAL-TIME] Handling remote bottle deleted');
    console.log('🗑️ [REAL-TIME] Message data:', message.data);
    
    const databaseService = getDatabaseService();
    if (databaseService) {
      // Find local bottle by unified ID and delete it
      const localBottle = await databaseService.findBottleById(message.data.id);
      
      if (localBottle) {
        console.log('🗑️ [REAL-TIME] Deleting local bottle', localBottle.id);
        await databaseService.deleteBottle(localBottle.id);
      } else {
        console.log('⚠️ [REAL-TIME] Could not find local bottle with ID', message.data.id);
      }
    }
  }

  // 🔥 NEW: Handle remote poop added
  private async handleRemotePoopAdded(message: any): Promise<void> {
    console.log('💩 [REAL-TIME] Handling remote poop added');
    console.log('💩 [REAL-TIME] Message received:', JSON.stringify(message, null, 2));
    console.log('💩 [REAL-TIME] Current device ID:', await this.getCurrentDeviceId());
    console.log('💩 [REAL-TIME] Message device ID:', message.deviceId);
    console.log('💩 [REAL-TIME] Device IDs match?', await this.getCurrentDeviceId() === message.deviceId);
    
    const databaseService = getDatabaseService();
    if (databaseService) {
      console.log('💩 [DEBUG] Calling databaseService.addPoop with sendWebSocketMessage: false');
      
      // Add poop locally
      await databaseService.addPoop(
        new Date(message.data.time),
        message.data.info,
        message.data.color,
        false // Don't send WebSocket message
      );
      
      console.log('💩 [DEBUG] Remote poop added successfully');
    } else {
      console.log('💩 [DEBUG] Database service not available');
    }
    console.log('💩 [DEBUG] ===== REMOTE POOP ADDED END =====');
  }

  // 🔥 NEW: Handle remote poop updated
  private async handleRemotePoopUpdated(message: any): Promise<void> {
    console.log('🔄 [REAL-TIME] Handling remote poop updated');
    // Find local poop by unified ID and update it
    const databaseService = getDatabaseService();
    if (databaseService) {
      const localPoop = await databaseService.findPoopById(message.data.id);
      if (localPoop) {
        await databaseService.updatePoop(localPoop.id, new Date(message.data.time), message.data.info);
      } else {
        console.log('⚠️ [REAL-TIME] Could not find local poop with ID', message.data.id);
      }
    }
  }

  // 🔥 NEW: Handle remote poop deleted
  private async handleRemotePoopDeleted(message: any): Promise<void> {
    console.log('🗑️ [REAL-TIME] Handling remote poop deleted');
    console.log('🗑️ [REAL-TIME] Message data:', message.data);
    
    const databaseService = getDatabaseService();
    if (databaseService) {
      // Find local poop by unified ID and delete it
      const localPoop = await databaseService.findPoopById(message.data.id);
      
      if (localPoop) {
        console.log('🗑️ [REAL-TIME] Deleting local poop', localPoop.id);
        await databaseService.deletePoop(localPoop.id);
      } else {
        console.log('⚠️ [REAL-TIME] Could not find local poop with ID', message.data.id);
      }
    }
  }

  // 🔥 NEW: Handle remote group updated
  private async handleRemoteGroupUpdated(message: any): Promise<void> {
    console.log('👥 [REAL-TIME] Handling remote group updated');
    // This would require updating local group data
    // For now, we'll sync from cloud to get the latest data
    const databaseService = getDatabaseService();
    if (databaseService) {
      await databaseService.syncFromCloud();
    }
  }

  // 🔥 NEW: Handle remote settings changed
  private async handleRemoteSettingsChanged(message: any): Promise<void> {
    console.log('⚙️ [REAL-TIME] Handling remote settings changed');
    // This would require updating local group settings
    // For now, we'll sync from cloud to get the latest data
    const databaseService = getDatabaseService();
    if (databaseService) {
      await databaseService.syncFromCloud();
    }
  }

  // 🔥 NEW: Handle remote data cleared
  private async handleRemoteDataCleared(message: any): Promise<void> {
    console.log('🧹 [REAL-TIME] Handling remote data cleared');
    const databaseService = getDatabaseService();
    if (databaseService) {
      // Clear local data and sync from cloud
      await databaseService.clearAllDataAndSyncFromCloud();
    }
  }

  // Listener system for status changes
  addListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.syncStatus });
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Nettoyer les ressources
  destroy(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
    // 🔥 REMOVED: No more periodic sync to stop
    // this.stopPeriodicSync();
  }

  // 🔥 REMOVED: Periodic sync - now using real-time events
  // private startPeriodicSync(): void {
  //   // Synchronization every 30 seconds for tests, then 2 minutes in production
  //   this.syncInterval = setInterval(async () => {
  //     if (this.syncStatus.isOnline) {
      //       console.log('🔄 Automatic periodic synchronization...');
  //       
  //       // 1. Sync local changes to cloud
  //       if (this.syncQueue.length > 0) {
  //         await this.sync();
  //         }
  //       
  //       // 2. Sync cloud changes to local
  //       try {
  //         await getDatabaseService()?.syncFromCloud();
  //       } catch (error) {
  //         console.error('Error syncing from cloud:', error);
  //       }
  //     }
  //   }, 30 * 1000); // 30 seconds for tests
  // }

  // 🔥 REMOVED: Stop periodic sync
  // private stopPeriodicSync(): void {
  //   if (this.syncInterval) {
  //     clearInterval(this.syncInterval);
  //     this.syncInterval = null;
  //   }
  // }
}

// Instance singleton
export const syncService = SyncService.getInstance();
export default syncService; 

// 🔥 NEW: Debug utility for sync issues
export const syncDebug = {
  // Log current sync status
  logSyncStatus(): void {
    const status = syncService.getSyncStatus();
    const queue = syncService.getSyncQueue();
  },

  // Clear sync queue (useful when sync gets stuck)
  async clearQueue(): Promise<void> {
    await syncService.clearSyncQueue();
  },

  // Force a sync
  async forceSync(): Promise<void> {
    await syncService.sync();
  }
}; 
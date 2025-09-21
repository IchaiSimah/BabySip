// Shared interfaces for services to avoid circular dependencies

export interface SyncServiceCallbacks {
  isOnline: () => boolean;
  addToSyncQueue: (item: any) => Promise<void>;
  sync: () => Promise<void>;
  initializeAfterAuth: () => Promise<void>; // ✅ ADDED: initialization method after auth
}

export interface DatabaseServiceCallbacks {
  syncFromCloud: () => Promise<void>;
  createGroup: (name: string, description: string, isShared: boolean) => Promise<any>;
  addBottle: (amount: number, time: Date, color: string, sendWebSocketMessage?: boolean) => Promise<boolean>;
  updateBottle: (bottleId: string, amount: number, time: Date, color?: string, sendWebSocketMessage?: boolean) => Promise<boolean>;
  addPoop: (time: Date, info: string | null, color?: string, sendWebSocketMessage?: boolean) => Promise<boolean>;
  updatePoop: (poopId: string, time: Date, info: string | null) => Promise<boolean>;
  deletePoop: (poopId: string) => Promise<boolean>;
  clearAllDataAndSyncFromCloud: () => Promise<boolean>;
  clearAllDataOnly: () => Promise<boolean>; // ✅ NOUVEAU : Pour logout sans sync
  deleteBottle: (bottleId: string) => Promise<boolean>;
  findBottleById: (bottleId: string) => Promise<any>;
  findPoopById: (poopId: string) => Promise<any>;
  getLastInsertedPoopId: () => Promise<number | null>;
}

// Global callback storage
let syncServiceCallbacks: SyncServiceCallbacks | null = null;
let databaseServiceCallbacks: DatabaseServiceCallbacks | null = null;
let databaseServiceInstance: any = null; // 🔥 NEW: Store the actual service instance

// Functions to set callbacks
export const setSyncServiceCallbacks = (callbacks: SyncServiceCallbacks) => {
  syncServiceCallbacks = callbacks;
};

export const setDatabaseServiceCallbacks = (callbacks: DatabaseServiceCallbacks) => {
  databaseServiceCallbacks = callbacks;
};

// 🔥 NEW: Function to set the database service instance
export const setDatabaseServiceInstance = (instance: any) => {
  databaseServiceInstance = instance;
};

// Helper functions to safely call service methods
export const getSyncService = () => {
  if (!syncServiceCallbacks) {
    console.warn('Sync service callbacks not set, sync operations will be skipped');
    return null;
  }
  return syncServiceCallbacks;
};

export const getDatabaseService = () => {
  if (!databaseServiceCallbacks) {
    // 🔥 NEW: Try to configure callbacks if we have the instance
    if (databaseServiceInstance) {
      console.log('🔄 [CALLBACKS] Configuring database callbacks from instance...');
      setDatabaseServiceCallbacks({
        syncFromCloud: () => databaseServiceInstance.syncFromCloud(),
        createGroup: (name: string, description: string, isShared: boolean) => databaseServiceInstance.createGroup(name, description, isShared),
        addBottle: (amount: number, time: Date, color: string, sendWebSocketMessage?: boolean) => databaseServiceInstance.addBottle(amount, time, color, sendWebSocketMessage),
        updateBottle: (bottleId: string, amount: number, time: Date, color?: string, sendWebSocketMessage?: boolean) => databaseServiceInstance.updateBottle(bottleId, amount, time, color, sendWebSocketMessage),
        addPoop: (time: Date, info: string | null, color?: string, sendWebSocketMessage?: boolean) => databaseServiceInstance.addPoop(time, info, color, sendWebSocketMessage),
        updatePoop: (poopId: string, time: Date, info: string | null) => databaseServiceInstance.updatePoop(poopId, time, info),
        deletePoop: (poopId: string) => databaseServiceInstance.deletePoop(poopId),
        clearAllDataAndSyncFromCloud: () => databaseServiceInstance.clearAllDataAndSyncFromCloud(),
  clearAllDataOnly: () => databaseServiceInstance.clearAllDataOnly(), // ✅ NOUVEAU : Pour logout sans sync
        deleteBottle: (bottleId: string) => databaseServiceInstance.deleteBottle(bottleId),
        findBottleById: (bottleId: string) => databaseServiceInstance.findBottleById(bottleId),
        findPoopById: (poopId: string) => databaseServiceInstance.findPoopById(poopId),
        getLastInsertedPoopId: () => databaseServiceInstance.getLastInsertedPoopId(),
      });
      console.log('✅ [CALLBACKS] Database callbacks configured successfully');
    } else {
      console.warn('Database service callbacks not set, database operations will be skipped');
    }
    return databaseServiceCallbacks;
  }
  return databaseServiceCallbacks;
};

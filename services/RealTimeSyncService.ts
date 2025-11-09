import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/config';
import apiService from './ApiService';

// --- Real-Time Message Types ---
export type RealTimeMessageType =
  | 'SYNC_REQUESTED'  // ✅ NEW: Only necessary message
  | 'GROUP_UPDATED'
  | 'SETTINGS_CHANGED'
  | 'DATA_CLEARED';

export interface RealTimeMessage {
  type: RealTimeMessageType;
  data: any;
  userId: number;
  groupId: number;
  timestamp: number;
  messageId?: string;
  deviceId?: string; // 🔥 NEW: Device ID to prevent loops
}

export interface RealTimeStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  lastConnected: number | null;
  error: string | null;
  reconnectAttempts: number;
}

// --- WebSocket Connection Manager ---
class RealTimeSyncService {
  private static instance: RealTimeSyncService;
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private status: RealTimeStatus = {
    isConnected: false,
    isConnecting: false,
    connectionAttempts: 0,
    lastConnected: null,
    error: null,
    reconnectAttempts: 0
  };

  private statusListeners: ((status: RealTimeStatus) => void)[] = [];
  private messageListeners: ((message: RealTimeMessage) => void)[] = [];
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  
  // 🔥 NEW: Persistent device ID for this session
  private sessionDeviceId: string | null = null;

  private constructor() {}

  static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService();
    }
    return RealTimeSyncService.instance;
  }

  // --- Connection Management ---
  async initialize(): Promise<void> {
    console.log('🚀 [REAL-TIME] Initializing WebSocket connection...');
    
    try {
      // Get auth token
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No auth token available');
      }

      // Get user profile
      const user = await apiService.getProfile();
      
      // Connect to WebSocket
      await this.connect(authToken, user.id);
      
      console.log('✅ [REAL-TIME] WebSocket initialized successfully');
    } catch (error) {
      console.error('❌ [REAL-TIME] Failed to initialize WebSocket:', error);
      this.updateStatus({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  private async connect(authToken: string, userId: number): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('🔗 [REAL-TIME] WebSocket already connected');
      return;
    }

    this.updateStatus({ isConnecting: true, error: null });

    try {
      // 🔥 FIXED: Use persistent device ID instead of generating new one each time
      const deviceId = await this.getDeviceId();
      this.sessionDeviceId = deviceId; // 🔥 CRITICAL FIX: Assign session device ID
      // Use environment-based WebSocket URL from config
      const wsUrl = `${API_CONFIG.WS_URL}?token=${authToken}&userId=${userId}&deviceId=${deviceId}`;
      console.log('🔗 [REAL-TIME] Connecting to:', wsUrl.replace(/token=[^&]+/, 'token=***'));

      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ [REAL-TIME] WebSocket connected');
        this.updateStatus({
          isConnected: true,
          isConnecting: false,
          connectionAttempts: 0,
          lastConnected: Date.now(),
          error: null,
          reconnectAttempts: 0
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: RealTimeMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ [REAL-TIME] Failed to parse message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 [REAL-TIME] WebSocket closed:', event.code, event.reason);
        this.handleDisconnection(event.code, event.reason);
      };

      this.ws.onerror = (error) => {
        console.error('❌ [REAL-TIME] WebSocket error:', error);
        this.updateStatus({ error: 'WebSocket connection error' });
      };

    } catch (error) {
      console.error('❌ [REAL-TIME] Failed to create WebSocket:', error);
      this.updateStatus({ 
        isConnecting: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  private handleDisconnection(code: number, reason: string): void {
    this.updateStatus({ isConnected: false });

    // Don't reconnect if it was a clean close
    if (code === 1000) {
      console.log('🔌 [REAL-TIME] Clean disconnect, not reconnecting');
      return;
    }

    // Attempt to reconnect
    if (this.status.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`🔄 [REAL-TIME] Attempting to reconnect (${this.status.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(async () => {
        try {
          const authToken = await AsyncStorage.getItem('authToken');
          const user = await apiService.getProfile();
          if (authToken) {
            await this.connect(authToken, user.id);
          }
        } catch (error) {
          console.error('❌ [REAL-TIME] Reconnection failed:', error);
          this.updateStatus({ 
            reconnectAttempts: this.status.reconnectAttempts + 1,
            error: 'Reconnection failed'
          });
        }
      }, this.reconnectDelay * Math.pow(2, this.status.reconnectAttempts)); // Exponential backoff
    } else {
      console.error('❌ [REAL-TIME] Max reconnection attempts reached');
      this.updateStatus({ error: 'Max reconnection attempts reached' });
    }
  }

  // --- Message Handling ---
  private handleMessage(message: RealTimeMessage): void {
    console.log('🔥 [DEBUG] ===== WEBSOCKET MESSAGE RECEIVED =====');
    console.log('🔥 [DEBUG] Message type:', message.type);
    console.log('🔥 [DEBUG] Full message:', JSON.stringify(message, null, 2));
    console.log('🔥 [DEBUG] Current device ID:', this.sessionDeviceId);
    console.log('🔥 [DEBUG] Message device ID:', message.deviceId);
    console.log('🔥 [DEBUG] Device IDs match?', this.sessionDeviceId === message.deviceId);
    
    //not supposed to happen
    if (this.sessionDeviceId === message.deviceId) {
      console.log('🔥 [DEBUG] Ignoring message from same device');
      console.log('🔥 [DEBUG] Session device ID:', this.sessionDeviceId);
      console.log('🔥 [DEBUG] Message device ID:', message.deviceId);
      console.log('🔥 [DEBUG] ===== WEBSOCKET MESSAGE IGNORED (SAME DEVICE) =====');
      return;
    }

    console.log('🔥 [DEBUG] Processing message from different device');
    
    // Notify message listeners
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('❌ [REAL-TIME] Error in message listener:', error);
      }
    });
    
    console.log('🔥 [DEBUG] ===== WEBSOCKET MESSAGE PROCESSED =====');
  }

  // --- Message Sending ---
  sendMessage(message: RealTimeMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ [REAL-TIME] WebSocket not connected, cannot send message');
      return;
    }

    try {
      const messageWithId = {
        ...message,
        messageId: `${message.type}_${Date.now()}_${Math.random()}`
      };
      
      this.ws.send(JSON.stringify(messageWithId));
    } catch (error) {
      console.error('❌ [REAL-TIME] Failed to send message:', error);
    }
  }

  // --- Status Management ---
  private updateStatus(updates: Partial<RealTimeStatus>): void {
    this.status = { ...this.status, ...updates };
    this.notifyStatusListeners();
  }

  private notifyStatusListeners(): void {
    this.statusListeners.forEach(listener => {
      try {
        listener({ ...this.status });
      } catch (error) {
        console.error('❌ [REAL-TIME] Error in status listener:', error);
      }
    });
  }

  // --- Public API ---
  getStatus(): RealTimeStatus {
    return { ...this.status };
  }

  isConnected(): boolean {
    return this.status.isConnected;
  }

  addStatusListener(listener: (status: RealTimeStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index > -1) {
        this.statusListeners.splice(index, 1);
      }
    };
  }

  addMessageListener(listener: (message: RealTimeMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      const index = this.messageListeners.indexOf(listener);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  // --- Cleanup ---
  disconnect(): void {
    console.log('🔌 [REAL-TIME] Disconnecting WebSocket...');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }

    this.updateStatus({
      isConnected: false,
      isConnecting: false,
      error: null
    });
  }

  destroy(): void {
    this.disconnect();
    this.statusListeners = [];
    this.messageListeners = [];
  }

  // 🔥 NEW: Get persistent device ID
  async getDeviceId(): Promise<string> {
    try {
      // 🔥 CRITICAL FIX: Use persistent device ID for this session
      if (!this.sessionDeviceId) {
        // 🔥 FIXED: Try to get existing device ID from storage first
        const existingDeviceId = await AsyncStorage.getItem('realTimeSessionDeviceId');
        
        if (existingDeviceId) {
          this.sessionDeviceId = existingDeviceId;
          console.log('🔥 [DEBUG] Reusing existing RealTimeSync device ID:', this.sessionDeviceId);
        } else {
          // 🔥 FIXED: Generate device ID only once and store it
          this.sessionDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem('realTimeSessionDeviceId', this.sessionDeviceId);
          console.log('🔥 [DEBUG] Generated new RealTimeSync device ID:', this.sessionDeviceId);
        }
      }
      console.log('🔥 [DEBUG] Returning RealTimeSync device ID:', this.sessionDeviceId);
      return this.sessionDeviceId;
    } catch (error) {
      console.error('❌ [REAL-TIME] Error getting device ID:', error);
      return `device_${Date.now()}_fallback`;
    }
  }
}

// Export singleton instance
const realTimeSyncService = RealTimeSyncService.getInstance();
export default realTimeSyncService;

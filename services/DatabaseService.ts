import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { IDService } from '../utils/idService';
import apiService from './ApiService';
import realTimeSyncService, { RealTimeMessage } from './RealTimeSyncService';
import { getSyncService, setDatabaseServiceInstance } from './ServiceInterfaces';

// --- Event System for Data Changes ---
export type DataChangeEventType = 
  | 'BOTTLE_ADDED'
  | 'BOTTLE_UPDATED' 
  | 'BOTTLE_DELETED'
  | 'POOP_ADDED'
  | 'POOP_UPDATED'
  | 'POOP_DELETED'
  | 'GROUP_UPDATED'
  | 'SETTINGS_CHANGED'
  | 'CLOUD_SYNC_COMPLETED'
  | 'SYNC_REQUESTED'; // ✅ NEW: To notify the end of a sync

export interface DataChangeEvent {
  type: DataChangeEventType;
  data: any;
  timestamp: number;
  groupId?: number;
  userId?: number;
}

type DataChangeListener = (event: DataChangeEvent) => void;

class EventEmitter {
  private listeners: DataChangeListener[] = [];

  addListener(listener: DataChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(event: DataChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in data change listener:', error);
      }
    });
  }

  // Backward compatibility - emit without data
  emitLegacy(): void {
    this.emit({
      type: 'BOTTLE_ADDED',
      data: null,
      timestamp: Date.now()
    });
  }
}

// Global event emitter for data changes
export const dataChangeEmitter = new EventEmitter();

// 🔥 NEW: Helper function to send real-time messages
const sendRealTimeMessage = async (type: RealTimeMessage['type'], data: any, groupId: number) => {
  try {
    // 🔥 FIXED: Check if WebSocket is connected before trying to send
    if (!realTimeSyncService.isConnected()) {
      console.log('ℹ️ [REAL-TIME] WebSocket not connected yet, skipping message (will sync via normal sync)');
      return;
    }

    // Get current user ID
    const user = await apiService.getProfile();
    
    // 🔥 FIXED: Use persistent device ID from RealTimeSyncService
    const deviceId = await realTimeSyncService.getDeviceId();
    
    const message: RealTimeMessage = {
      type,
      data,
      userId: user.id,
      groupId,
      timestamp: Date.now(),
      deviceId // 🔥 NEW: Include device ID in message
    };
    
    realTimeSyncService.sendMessage(message);
    console.log('📡 [REAL-TIME] Sent SYNC_REQUESTED message with device ID:', deviceId);
  } catch (error) {
    console.error('❌ [REAL-TIME] Failed to send message:', error);
  }
};

// --- Interfaces ---
interface Group {
  id: number;
  name: string;
  users: string;
  time_difference: number;
  last_bottle: number;
  bottles_to_show: number;
  poops_to_show: number;
  created_at: string;
  description?: string;
  is_shared?: boolean;
}

interface Entry {
  id: string;                    // ✅ CHANGED: string instead of number
  group_id: number;
  amount: number;
  time: string;
  color?: string;
  sync_status: 'pending' | 'synced' | 'error';  // ✅ CHANGED: updated values
  created_at: string;
  updated_at: string;            // ✅ ADDED: updated_at field
}

interface Poop {
  id: string;                    // ✅ CHANGED: string instead of number
  group_id: number;
  time: string;
  info: string | null;
  color?: string;
  sync_status: 'pending' | 'synced' | 'error';  // ✅ CHANGED: updated values
  created_at: string;
  updated_at: string;            // ✅ ADDED: updated_at field
}

interface GroupSettings {
  bottles_to_show: number;
  poops_to_show: number;
  last_bottle: number;
  time_difference: number;
}

interface TodayStats {
  totalBottles: number;
  totalAmount: number;
  totalPoops: number;
  averageAmount: number;
}

interface GroupInfo {
  id: number;
  name: string;
  users: number[];
  entries: Entry[];
  poop: Poop[];
  time_difference: number;
  last_bottle: number;
  bottles_to_show: number;
  poops_to_show: number;
  user_messages?: Record<string, { main_message_id: number; main_chat_id: number }>;
}

// --- Database Helper Functions ---
async function executeQuery(db: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<any> {
  try {
    if (!db) {
      throw new Error('Database connection is null');
    }
    return await db.runAsync(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function getFirstRow(db: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<any | null> {
  try {
    if (!db) {
      throw new Error('Database connection is null');
    }
    return await db.getFirstAsync(sql, params);
  } catch (error) {
    console.error('Database getFirstRow error:', error);
    return null;
  }
}

async function getAllRows(db: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<any[]> {
  try {
    if (!db) {
      throw new Error('Database connection is null');
    }
    return await db.getAllAsync(sql, params);
  } catch (error) {
    console.error('Database getAllRows error:', error);
    return [];
  }
}

// --- Main Database Service ---
class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = 'baby_bottle_tracker.db';
  private isInitializing = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // --- Database Initialization ---
  async initDatabase(): Promise<boolean> {
    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.db !== null;
    }

    this.isInitializing = true;
    
    try {
      if (!this.db) {
        this.db = await SQLite.openDatabaseAsync(this.dbName);
        await this.createTables();
      }
      
      // Test connection
      await this.db.execAsync('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      this.db = null;
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const tables = [
      `CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        group_id INTEGER DEFAULT 1,
        amount INTEGER NOT NULL,
        time DATETIME NOT NULL,
        color TEXT DEFAULT '#6366F1',
        sync_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS poop (
        id TEXT PRIMARY KEY,
        group_id INTEGER DEFAULT 1,
        time DATETIME NOT NULL,
        info TEXT,
        color TEXT DEFAULT '#8B4513',
        sync_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS user_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER DEFAULT 1,
        user_id INTEGER NOT NULL,
        main_message_id INTEGER,
        main_chat_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        language TEXT DEFAULT 'en',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS deleted_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_to_cloud INTEGER DEFAULT 0
      )`
    ];

    for (const tableQuery of tables) {
      try {
        await this.db.execAsync(tableQuery);
      } catch (error) {
        console.error('Error creating table:', error);
      }
    }
    
    // Run migrations for existing databases
    await this.runMigrations();
  }

  // --- Database Migrations ---
  // Handle schema changes for existing databases
  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    try {
      // Migration 1: Add color field to existing entries table
      await this.migrateAddColorField();
      
      // Removed group-related migrations
      
      // Migration 3: Add sync fields to entries table
      await this.migrateAddEntriesSyncFields();
      
      // Migration 4: Add sync fields to poop table
      await this.migrateAddPoopSyncFields();
      
      // Keep entries/poop migrations only
      
      // Migration 6: Add color field to poop table
      await this.migrateAddPoopColorField();
    } catch (error) {
      console.error('Error running migrations:', error);
    }
  }

  private async migrateAddColorField(): Promise<void> {
    if (!this.db) return;

    try {
      // Check if color column already exists
      const tableInfo = await this.db.getAllAsync("PRAGMA table_info(entries)");
      const hasColorColumn = tableInfo.some((column: any) => column.name === 'color');
      
      if (!hasColorColumn) {
        console.log('🔄 [MIGRATION] Adding color field to entries table...');
        
        // Add color column to existing entries table
        await this.db.execAsync("ALTER TABLE entries ADD COLUMN color TEXT DEFAULT '#6366F1'");
        
        // Update existing entries to have the default color
        await this.db.execAsync("UPDATE entries SET color = '#6366F1' WHERE color IS NULL");
        
        console.log('✅ [MIGRATION] Color field migration completed');
      }
    } catch (error) {
      console.error('❌ [MIGRATION] Error adding color field:', error);
    }
  }

  // Removed migrateAddGroupSyncFields (groups table is deprecated)

  private async migrateAddEntriesSyncFields(): Promise<void> {
    if (!this.db) return;

    try {
      const tableInfo = await this.db.getAllAsync("PRAGMA table_info(entries)");
      const hasSyncStatus = tableInfo.some((column: any) => column.name === 'sync_status');
      
      if (!hasSyncStatus) {
        console.log('🔄 [MIGRATION] Adding sync_status field to entries table...');
        await this.db.execAsync("ALTER TABLE entries ADD COLUMN sync_status TEXT DEFAULT 'pending'");
      }
      
      console.log('✅ [MIGRATION] Entries sync fields migration completed');
    } catch (error) {
      console.error('❌ [MIGRATION] Error adding entries sync fields:', error);
    }
  }

  private async migrateAddPoopSyncFields(): Promise<void> {
    if (!this.db) return;

    try {
      const tableInfo = await this.db.getAllAsync("PRAGMA table_info(poop)");
      const hasSyncStatus = tableInfo.some((column: any) => column.name === 'sync_status');
      
      if (!hasSyncStatus) {
        console.log('🔄 [MIGRATION] Adding sync_status field to poop table...');
        await this.db.execAsync("ALTER TABLE poop ADD COLUMN sync_status TEXT DEFAULT 'local'");
      }
      
      console.log('✅ [MIGRATION] Poop sync fields migration completed');
    } catch (error) {
      console.error('❌ [MIGRATION] Error adding poop sync fields:', error);
    }
  }

  private async migrateAddPoopColorField(): Promise<void> {
    if (!this.db) return;

    try {
      // Check if color column already exists
      const tableInfo = await this.db.getAllAsync("PRAGMA table_info(poop)");
      const hasColorColumn = tableInfo.some((column: any) => column.name === 'color');
      
      if (!hasColorColumn) {
        console.log('🔄 [MIGRATION] Adding color field to poop table...');
        
        // Add color column to existing poop table
        await this.db.execAsync("ALTER TABLE poop ADD COLUMN color TEXT DEFAULT '#8B4513'");
        
        // Update existing poops to have the default color
        await this.db.execAsync("UPDATE poop SET color = '#8B4513' WHERE color IS NULL");
        
        console.log('✅ [MIGRATION] Poop color field migration completed');
      }
    } catch (error) {
      console.error('❌ [MIGRATION] Error adding poop color field:', error);
    }
  }

  // Removed migrateRemoveGroupConstraints (group constraints deprecated)
  // --- Language Management ---
  async getUserLanguage(userId: number): Promise<string> {
    if (!await this.initDatabase() || !this.db) return 'en';

    try {
      const result = await getFirstRow(this.db,
        `SELECT language FROM languages WHERE user_id = ?`,
        [userId]
      );
      return result?.language || 'en';
    } catch (error) {
      console.error('Error getting user language:', error);
      return 'en';
    }
  }

  async setUserLanguage(userId: number, language: string): Promise<boolean> {
    if (!await this.initDatabase() || !this.db) return false;

    try {
      await executeQuery(this.db,
        `INSERT OR REPLACE INTO languages (user_id, language) VALUES (?, ?)`,
        [userId, language]
      );
      return true;
    } catch (error) {
      console.error('Error setting user language:', error);
      return false;
    }
  }

  // --- Bottle Management ---
  async getRecentBottles(limit: number = 10): Promise<Entry[]> {
    if (!await this.initDatabase() || !this.db) return [];

    try {
      return await getAllRows(this.db,
        `SELECT * FROM entries ORDER BY time DESC LIMIT ?`,
        [limit]
      ) as Entry[];
    } catch (error) {
      console.error('Error getting recent bottles:', error);
      return [];
    }
  }

  async addBottle(amount: number, time: Date, color: string = '#6366F1', sendWebSocketMessage: boolean = true): Promise<string | null> {
    if (!await this.initDatabase() || !this.db) return null;

    try {
      console.log('🔥 [DEBUG] ===== ADD BOTTLE START =====');
      console.log('🔥 [DEBUG] Parameters:', { amount, time: time.toISOString(), color, sendWebSocketMessage });
      
      // ✅ Generate a unified ID
      const id = IDService.generateUniqueId();
      console.log('🔥 [DEBUG] Generated unified ID:', id);
      
      await executeQuery(this.db,
        `INSERT INTO entries (id, amount, time, color, sync_status) VALUES (?, ?, ?, ?, ?)`,
        [id, amount, time.toISOString(), color, 'pending']
      );
      
      console.log('🔥 [DEBUG] Bottle inserted into database with unified ID');
      
      // 🔥 CRITICAL FIX: Emit data change event
      console.log('🔥 [DEBUG] Emitting data change event');
      dataChangeEmitter.emit({
        type: 'BOTTLE_ADDED',
        data: { id, amount, time, color },
        timestamp: Date.now()
      });     
      console.log('🔥 [DEBUG] ===== ADD BOTTLE END =====');
      return id;
    } catch (error) {
      console.error('Error adding bottle:', error);
      return null;
    }
  }

  async updateBottle(bottleId: string, amount: number, time: Date, color?: string, sendWebSocketMessage: boolean = true): Promise<boolean> {
    if (!await this.initDatabase() || !this.db) return false;

    try {
      const updateFields = ['amount = ?', 'time = ?'];
      const params = [amount, time.toISOString()];
      
      if (color !== undefined) {
        updateFields.push('color = ?');
        params.push(color);
      }
      
      params.push(bottleId);
      
      await executeQuery(this.db,
        `UPDATE entries SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );
      
      // 🔥 CRITICAL FIX: Emit data change event
      dataChangeEmitter.emit({
        type: 'BOTTLE_UPDATED',
        data: { bottleId, amount, time, color },
        timestamp: Date.now()
      });

      // // 🔥 NEW: Send WebSocket message for real-time sync (only if requested)
      // if (sendWebSocketMessage) {
      //   await sendRealTimeMessage('SYNC_REQUESTED', { 
      //     type: 'bottles',
      //     timestamp: Date.now()
      //   }, 1);
      // }
      
      return true;
    } catch (error) {
      console.error('Error updating bottle:', error);
      return false;
    }
  }

  async deleteBottle(bottleId: string): Promise<boolean> {
    if (!await this.initDatabase() || !this.db) return false;

    try {
      // Delete the bottle
      await executeQuery(this.db,
        `DELETE FROM entries WHERE id = ?`,
        [bottleId]
      );
      
      // 🔥 CRITICAL FIX: Emit data change event
      dataChangeEmitter.emit({
        type: 'BOTTLE_DELETED',
        data: { bottleId },
        timestamp: Date.now()
      });

      // // 🔥 NEW: Send WebSocket message to notify other devices
      //   await sendRealTimeMessage('SYNC_REQUESTED', { 
      //   type: 'bottles',
      //   timestamp: Date.now()
      //   }, 1);
      
      return true;
    } catch (error) {
      console.error('Error deleting bottle:', error);
      return false;
    }
  }

  async getBottleById(bottleId: string): Promise<Entry | null> {
    if (!await this.initDatabase() || !this.db) return null;

    try {
      return await getFirstRow(this.db,
        `SELECT * FROM entries WHERE id = ?`,
        [bottleId]
      ) as Entry;
    } catch (error) {
      console.error('Error getting bottle by ID:', error);
      return null;
    }
  }

    // 🔥 REMOVED: All cloud_id related methods - no longer needed with unified ID system

  // ✅ New unified ID search method
  async findBottleById(id: string): Promise<Entry | null> {
    if (!await this.initDatabase() || !this.db) return null;

    try {
      return await getFirstRow(this.db,
        `SELECT * FROM entries WHERE id = ?`,
        [id]
      ) as Entry;
    } catch (error) {
      console.error('Error finding bottle by ID:', error);
      return null;
    }
  }

  // ✅ New unified ID search method
  async findPoopById(id: string): Promise<Poop | null> {
    if (!await this.initDatabase() || !this.db) return null;

    try {
      return await getFirstRow(this.db,
        `SELECT * FROM poop WHERE id = ?`,
        [id]
      ) as Poop;
    } catch (error) {
      console.error('Error finding poop by ID:', error);
      return null;
    }
  }

  // 🔥 NEW: Get last inserted bottle ID
  async getLastInsertedBottleId(): Promise<number | null> {
    if (!await this.initDatabase() || !this.db) return null;

    try {
      const result = await getFirstRow(this.db,
        `SELECT last_insert_rowid() as id`
      );
      return result?.id || null;
    } catch (error) {
      console.error('Error getting last inserted bottle ID:', error);
      return null;
    }
  }

  // 🔥 NEW: Get last inserted poop ID
  async getLastInsertedPoopId(): Promise<number | null> {
    if (!await this.initDatabase() || !this.db) return null;

    try {
      const result = await getFirstRow(this.db,
        `SELECT last_insert_rowid() as id`
      );
      return result?.id || null;
    } catch (error) {
      console.error('Error getting last inserted poop ID:', error);
      return null;
    }
  }
  async getRecentPoops(limit: number = 5): Promise<Poop[]> {
    if (!await this.initDatabase() || !this.db) return [];

    try {
      return await getAllRows(this.db,
        `SELECT * FROM poop ORDER BY time DESC LIMIT ?`,
        [limit]
      ) as Poop[];
    } catch (error) {
      console.error('Error getting recent poops:', error);
      return [];
    }
  }

  async addPoop(time: Date, info: string | null = null, color: string = '#8B4513', sendWebSocketMessage: boolean = true): Promise<string|null> {
    if (!await this.initDatabase() || !this.db) return null;

    try {
      console.log('🔥 [DEBUG] ===== ADD POOP START =====');
      console.log('🔥 [DEBUG] Parameters:', { time: time.toISOString(), info, color, sendWebSocketMessage });
      
      // ✅ Generate a unified ID
      const id = IDService.generateUniqueId();
      console.log('🔥 [DEBUG] Generated unified ID:', id);
      
      await executeQuery(this.db,
        `INSERT INTO poop (id, time, info, color, sync_status) VALUES (?, ?, ?, ?, ?)`,
        [id, time.toISOString(), info, color, 'pending']
      );
      
      console.log('🔥 [DEBUG] Poop inserted into database with unified ID');
      
      // 🔥 CRITICAL FIX: Emit data change event
      console.log('🔥 [DEBUG] Emitting data change event');
      dataChangeEmitter.emit({
        type: 'POOP_ADDED',
        data: { id, time, info, color },
        timestamp: Date.now()
      });

      // // 🔥 FIXED: Only send WebSocket message if requested (manual additions)
      // if (sendWebSocketMessage) {
      //   console.log('🔥 [DEBUG] Sending WebSocket message');
      //   await sendRealTimeMessage('SYNC_REQUESTED', { 
      //     type: 'poops',
      //     timestamp: Date.now()
      //   }, 1);
      // } else {
      //   console.log('🔥 [DEBUG] Skipping WebSocket message (remote poop)');
      // }
      
      console.log('🔥 [DEBUG] ===== ADD POOP END =====');
      return id;
    } catch (error) {
      console.error('Error adding poop:', error);
      return null;
    }
  }

  async updatePoop(poopId: string, time: Date, info: string | null): Promise<boolean> {
    if (!await this.initDatabase() || !this.db) return false;

    try {
      await executeQuery(this.db,
        `UPDATE poop SET time = ?, info = ? WHERE id = ?`,
        [time.toISOString(), info, poopId]
      );
      
      // 🔥 CRITICAL FIX: Emit data change event
      dataChangeEmitter.emit({
        type: 'SYNC_REQUESTED',
        data: { poopId, time, info },
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating poop:', error);
      return false;
    }
  }

  async deletePoop(poopId: string): Promise<boolean> {
    if (!await this.initDatabase() || !this.db) return false;

    try {
      // Delete the poop
      await executeQuery(this.db,
        `DELETE FROM poop WHERE id = ?`,
        [poopId]
      );
      
      // 🔥 CRITICAL FIX: Emit data change event
      dataChangeEmitter.emit({
        type: 'POOP_DELETED',
        data: { poopId },
        timestamp: Date.now()
      });

      // // 🔥 NEW: Send WebSocket message for real-time sync
      //   await sendRealTimeMessage('SYNC_REQUESTED', { 
      //   type: 'poops',
      //   timestamp: Date.now()
      //   }, 1);
      
      return true;
    } catch (error) {
      console.error('Error deleting poop:', error);
      return false;
    }
  }

  // --- Group Settings ---
  async getGroupSettings(groupId: number): Promise<GroupSettings | null> {
    if (!await this.initDatabase() || !this.db) return null;

    try {
      return await getFirstRow(this.db,
        `SELECT bottles_to_show, poops_to_show, last_bottle, time_difference FROM groups WHERE id = ?`,
        [groupId]
      ) as GroupSettings;
    } catch (error) {
      console.error('Error getting group settings:', error);
      return null;
    }
  }



  // --- Statistics ---
  async getTodayBottles(): Promise<Entry[]> {
    if (!await this.initDatabase() || !this.db) return [];

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      return await getAllRows(this.db,
        `SELECT * FROM entries WHERE time >= ? AND time < ? ORDER BY time DESC`,
        [startOfDay, endOfDay]
      ) as Entry[];
    } catch (error) {
      console.error('Error getting today bottles:', error);
      return [];
    }
  }

  async getTodayPoops(): Promise<Poop[]> {
    if (!await this.initDatabase() || !this.db) return [];

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      return await getAllRows(this.db,
        `SELECT * FROM poop WHERE time >= ? AND time < ? ORDER BY time DESC`,
        [startOfDay, endOfDay]
      ) as Poop[];
    } catch (error) {
      console.error('Error getting today poops:', error);
      return [];
    }
  }

  async getTodayStats(): Promise<TodayStats> {
    if (!await this.initDatabase()) {
      return { totalBottles: 0, totalAmount: 0, totalPoops: 0, averageAmount: 0 };
    }

    try {
      const bottles = await this.getTodayBottles();
      const poops = await this.getTodayPoops();

      const totalBottles = bottles.length;
      const totalAmount = bottles.reduce((sum, bottle) => sum + bottle.amount, 0);
      const totalPoops = poops.length;
      const averageAmount = totalBottles > 0 ? Math.round(totalAmount / totalBottles) : 0;

      return { totalBottles, totalAmount, totalPoops, averageAmount };
    } catch (error) {
      console.error('Error getting today stats:', error);
      return { totalBottles: 0, totalAmount: 0, totalPoops: 0, averageAmount: 0 };
    }
  }

  // --- Hybrid Methods (Local + Cloud Sync) ---
  
  // Add bottle with hybrid approach (local first, then sync)
  async addBottleHybrid(amount: number, time: Date, color: string = '#6366F1'): Promise<boolean> {
    try {
      console.log('🔥 [HYBRID] Starting hybrid bottle add...');
      
      // 1. Save locally first for immediate UI response
      const bottleId = await this.addBottle(amount, time, color, false); // Don't send WebSocket yet
      
      if (!bottleId) {
        console.error('❌ [HYBRID] Failed to save bottle locally');
        return false;
      }

      console.log('✅ [HYBRID] Bottle saved locally, starting background sync...');
      
      // 🔥 CRITICAL FIX: Get the ID directly from the database after insertion
      if (!this.db) {
        console.error('❌ [HYBRID] Database not available');
        return false;
      }
      
      console.log('🔄 [HYBRID] Retrieved bottle ID for sync:', bottleId);
      
      // 2. Add to sync queue for background cloud sync (always, even offline)
      const syncService = getSyncService();
      
      if (syncService) {
        await syncService.addToSyncQueue({
          type: 'bottle',
          action: 'create',
          data: {
            id: bottleId,
            amount,
            time: time.toISOString(),
            color,
          }
        });
      }

      if (syncService && syncService.isOnline()) {
        // 3. Start background sync (non-blocking) - only if online
        syncService.sync().then(() => {
          console.log('✅ [HYBRID] Background sync completed successfully');
        }).catch((error) => {
          console.error('❌ [HYBRID] Background sync failed:', error);
        });
        
        // 4. Send WebSocket message for real-time sync with other devices - only if online
        sendRealTimeMessage('SYNC_REQUESTED', { 
          type: 'bottles',
          timestamp: Date.now()
        }, 1).then(() => {
          console.log('📡 [HYBRID] WebSocket message sent to other devices');
        }).catch((error) => {
          console.error('❌ [HYBRID] WebSocket message failed:', error);
        });
      } else {
        console.log('📱 [HYBRID] Offline - bottle queued for later sync');
      }
      
      console.log('🎉 [HYBRID] Hybrid bottle add completed successfully');
      return true;
    } catch (error) {
      console.error('❌ [HYBRID] Error in addBottleHybrid:', error);
      return false;
    }
  }

  // Add poop with hybrid approach (local first, then sync)
  async addPoopHybrid(time: Date, info: string | null, color: string = '#8B4513'): Promise<boolean> {
    try {
      console.log('🔥 [HYBRID] Starting hybrid poop add...');
      
      // 1. Save locally first for immediate UI response
      const poopId = await this.addPoop(time, info, color, false); // Don't send WebSocket yet
      
      if (!poopId) {
        console.error('❌ [HYBRID] Failed to save poop locally');
        return false;
      }

      console.log('✅ [HYBRID] Poop saved locally, starting background sync...');
      
      // 🔥 CRITICAL FIX: Get the ID of the poop that was just added

      
      console.log('🔄 [HYBRID] Retrieved poop ID for sync:', poopId);
      
      // 2. Add to sync queue for background cloud sync (always, even offline)
      const syncService = getSyncService();
      
      if (syncService) {
        await syncService.addToSyncQueue({
          type: 'poop',
          action: 'create',
          data: {
            id: poopId,
            time: time.toISOString(),
            info,
            color,
          }
        });
      }

      if (syncService && syncService.isOnline()) {
        // 3. Start background sync (non-blocking) - only if online
        syncService.sync().then(() => {
          console.log('✅ [HYBRID] Background sync completed successfully');
        }).catch((error) => {
          console.error('❌ [HYBRID] Background sync failed:', error);
        });
        
        // 4. Send WebSocket message for real-time sync with other devices - only if online
        sendRealTimeMessage('SYNC_REQUESTED', { 
          type: 'poops',
          timestamp: Date.now()
        }, 1).then(() => {
          console.log('📡 [HYBRID] WebSocket message sent to other devices');
        }).catch((error) => {
          console.error('❌ [HYBRID] WebSocket message failed:', error);
        });
      } else {
        console.log('📱 [HYBRID] Offline - poop queued for later sync');
      }
      
      console.log('🎉 [HYBRID] Hybrid poop add completed successfully');
      return true;
    } catch (error) {
      console.error('❌ [HYBRID] Error in addPoopHybrid:', error);
      return false;
    }
  }

  // Update bottle with hybrid approach
  async updateBottleHybrid(bottleId: string, amount: number, time: Date, color: string): Promise<boolean> {
    try {
      console.log('🔥 [HYBRID] Starting hybrid bottle update...');
      
      // 1. Update locally first for immediate UI response
      const success = await this.updateBottle(bottleId, amount, time, color, false); // Don't send WebSocket yet
      
      if (!success) {
        console.error('❌ [HYBRID] Failed to update bottle locally');
        return false;
      }

      console.log('✅ [HYBRID] Bottle updated locally, starting background sync...');
      
      // 2. Add to sync queue for background cloud sync (always, even offline)
      const syncService = getSyncService();
      
      if (syncService) {
        await syncService.addToSyncQueue({
          type: 'bottle',
          action: 'update',
          data: {
            id: bottleId,
            amount,
            time: time.toISOString(),
            color,
          }
        });
      }

      if (syncService && syncService.isOnline()) {
        // 3. Start background sync (non-blocking) - only if online
        syncService.sync().then(() => {
          console.log('✅ [HYBRID] Background sync completed successfully');
        }).catch((error) => {
          console.error('❌ [HYBRID] Background sync failed:', error);
        });
        
        // 4. Send WebSocket message for real-time sync with other devices - only if online
        sendRealTimeMessage('SYNC_REQUESTED', { 
          type: 'bottles',
          timestamp: Date.now()
        }, 1).then(() => {
          console.log('📡 [HYBRID] WebSocket message sent to other devices');
        }).catch((error) => {
          console.error('❌ [HYBRID] WebSocket message failed:', error);
        });
      } else {
        console.log('📱 [HYBRID] Offline - bottle update queued for later sync');
      }
      
      console.log('🎉 [HYBRID] Hybrid bottle update completed successfully');
      return true;
    } catch (error) {
      console.error('❌ [HYBRID] Error in updateBottleHybrid:', error);
      return false;
    }
  }

  // Update poop with hybrid approach
  async updatePoopHybrid(poopId: string, time: Date, info: string | null): Promise<boolean> {
    try {
      console.log('🔥 [HYBRID] Starting hybrid poop update...');
      
      // 1. Update locally first for immediate UI response
      const success = await this.updatePoop(poopId, time, info);
      
      if (!success) {
        console.error('❌ [HYBRID] Failed to update poop locally');
        return false;
      }

      console.log('✅ [HYBRID] Poop updated locally, starting background sync...');
      
      // 2. Add to sync queue for background cloud sync (always, even offline)
      const syncService = getSyncService();
      
      if (syncService) {
        await syncService.addToSyncQueue({
          type: 'poop',
          action: 'update',
          data: {
            id: poopId,
            time: time.toISOString(),
            info,
          }
        });
      }

      if (syncService && syncService.isOnline()) {
        // 3. Start background sync (non-blocking) - only if online
        syncService.sync().then(() => {
          console.log('✅ [HYBRID] Background sync completed successfully');
        }).catch((error) => {
          console.error('❌ [HYBRID] Background sync failed:', error);
        });
        
        // 4. Send WebSocket message for real-time sync with other devices - only if online
        sendRealTimeMessage('SYNC_REQUESTED', { 
          id: poopId,
          type: 'poops',
          timestamp: Date.now()
        }, 1).then(() => {
          console.log('📡 [HYBRID] WebSocket message sent to other devices');
        }).catch((error) => {
          console.error('❌ [HYBRID] WebSocket message failed:', error);
        });
      } else {
        console.log('📱 [HYBRID] Offline - poop update queued for later sync');
      }

      console.log('🎉 [HYBRID] Hybrid poop update completed successfully');
      return true;
    } catch (error) {
      console.error('❌ [HYBRID] Error in updatePoopHybrid:', error);
      return false;
    }
  }

  // Delete bottle with hybrid approach
  async deleteBottleHybrid(bottleId: string): Promise<boolean> {
    try {
      console.log('🔥 [HYBRID] Starting hybrid bottle delete...');
      
      // 1. Delete locally first for immediate UI response
      const success = await this.deleteBottle(bottleId);
      
      if (!success) {
        console.error('❌ [HYBRID] Failed to delete bottle locally');
        return false;
      }

      console.log('✅ [HYBRID] Bottle deleted locally, starting background sync...');
      
      // 2. Add to sync queue for background cloud sync (always, even offline)
      const syncService = getSyncService();
      
      if (syncService) {
        await syncService.addToSyncQueue({
          type: 'bottle',
          action: 'delete',
          data: { id: bottleId }
        });
      }

      if (syncService && syncService.isOnline()) {
        // 3. Start background sync (non-blocking) - only if online
        syncService.sync().then(() => {
          console.log('✅ [HYBRID] Background sync completed successfully');
        }).catch((error) => {
          console.error('❌ [HYBRID] Background sync failed:', error);
        });
        
        // 4. Send WebSocket message for real-time sync with other devices - only if online
        sendRealTimeMessage('SYNC_REQUESTED', { 
          type: 'bottles',
          timestamp: Date.now()
        }, 1).then(() => {
          console.log('📡 [HYBRID] WebSocket message sent to other devices');
        }).catch((error) => {
          console.error('❌ [HYBRID] WebSocket message failed:', error);
        });
      } else {
        console.log('📱 [HYBRID] Offline - bottle delete queued for later sync');
      }

      console.log('🎉 [HYBRID] Hybrid bottle delete completed successfully');
      return true;
    } catch (error) {
      console.error('❌ [HYBRID] Error in deleteBottleHybrid:', error);
      return false;
    }
  }

  // Delete poop with hybrid approach
  async deletePoopHybrid(poopId: string): Promise<boolean> {
    try {
      console.log('🔥 [HYBRID] Starting hybrid poop delete...');
      
      // 1. Delete locally first for immediate UI response
      const success = await this.deletePoop(poopId);
      
      if (!success) {
        console.error('❌ [HYBRID] Failed to delete poop locally');
        return false;
      }

      console.log('✅ [HYBRID] Poop deleted locally, starting background sync...');
      
      // 2. Add to sync queue for background cloud sync (always, even offline)
      const syncService = getSyncService();
      
      if (syncService) {
        await syncService.addToSyncQueue({
          type: 'poop',
          action: 'delete',
          data: { id: poopId }
        });
      }

      if (syncService && syncService.isOnline()) {
        // 3. Start background sync (non-blocking) - only if online
        syncService.sync().then(() => {
          console.log('✅ [HYBRID] Background sync completed successfully');
        }).catch((error) => {
          console.error('❌ [HYBRID] Background sync failed:', error);
        });
        
        // 4. Send WebSocket message for real-time sync with other devices - only if online
        sendRealTimeMessage('SYNC_REQUESTED', { 
          type: 'poops',
          timestamp: Date.now()
        }, 1).then(() => {
          console.log('📡 [HYBRID] WebSocket message sent to other devices');
        }).catch((error) => {
          console.error('❌ [HYBRID] WebSocket message failed:', error);
        });
      } else {
        console.log('📱 [HYBRID] Offline - poop delete queued for later sync');
      }

      console.log('🎉 [HYBRID] Hybrid poop delete completed successfully');
      return true;
    } catch (error) {
      console.error('❌ [HYBRID] Error in deletePoopHybrid:', error);
      return false;
    }
  }

  // Sync from cloud to local (optimized for last 20 bottles)
  async syncFromCloud(): Promise<void> {
    try {
      const syncService = getSyncService();
      if (!syncService?.isOnline()) {
        return;
      }

      console.log('Starting cloud sync (last 20 bottles)...');
      
      // Get user ID from auth service
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        return;
      }

      // Get user profile to get user ID
      const user = await apiService.getProfile();
      
      // Get bottles from cloud (last 20 bottles)
      const { bottles } = await apiService.getBottles(20);
      console.log('Found bottles (last 20):', bottles.length);
      
      // 🔥 CRITICAL FIX: Sync deletions from cloud to local
      await this.syncDeletionsFromCloud(bottles);

      // 🔥 NEW: Sync bottles from cloud to local
      for (const bottle of bottles) {
        await this.syncBottleFromCloud(bottle);
      }

      // Get poops from cloud (last 20 poops)
      try {
        const { poops } = await apiService.getPoops(20);
        console.log('Found poops (last 20):', poops.length);
        
        // 🔥 NEW: Sync poop deletions from cloud to local
        await this.syncPoopDeletionsFromCloud(poops);
        
        // 🔥 NEW: Sync poops
        for (const poop of poops) {
          await this.syncPoopFromCloud(poop);
        }
        
        console.log(`✅ Optimized cloud sync completed: ${bottles.length} bottles synced, ${poops.length} poops synced`);
        
        // 🔥 CRITICAL FIX: Emit data change event to refresh UI after sync
        dataChangeEmitter.emit({
          type: 'CLOUD_SYNC_COMPLETED',
          data: { 
            bottlesSynced: bottles.length, 
            poopsSynced: poops.length 
          },
          timestamp: Date.now()
        });
              } catch (error: any) {
          // 🔥 CRITICAL FIX: Handle 404 error when poop API is not available
          if (error.response?.status === 404) {
            console.log('⚠️ [SYNC] Poop API not available on server, skipping poop sync');
            console.log(`✅ Optimized cloud sync completed: ${bottles.length} bottles synced (poops skipped)`);
            
            // 🔥 CRITICAL FIX: Emit data change event even when poops are skipped
            dataChangeEmitter.emit({
              type: 'CLOUD_SYNC_COMPLETED',
              data: { 
                bottlesSynced: bottles.length, 
                poopsSynced: 0 
              },
              timestamp: Date.now()
            });
          } else {
            // Re-throw other errors
            throw error;
          }
        }
    } catch (error: any) {
      console.error('❌ Error syncing from cloud:', error);
      console.error('🔍 [DEBUG] Error details:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    }
  }

  // 🔥 NEW: Sync poop deletions from cloud to local
  private async syncPoopDeletionsFromCloud(cloudPoops: any[]): Promise<void> {
    if (!await this.initDatabase() || !this.db) return;

    try {
      // Get all local poops
      const localPoops = await getAllRows(this.db,
        `SELECT id FROM poop`
      );

      // Create a set of cloud poop IDs for fast lookup
      const cloudPoopIds = new Set(cloudPoops.map(poop => poop.id));

      // Find local poops that don't exist in cloud anymore (deleted on cloud)
      for (const localPoop of localPoops) {
        if (!cloudPoopIds.has(localPoop.id)) {
          console.log(`🗑️ [CLOUD DELETE SYNC] Poop ${localPoop.id} deleted on cloud, deleting locally`);
          
          // Delete the local poop
          await executeQuery(this.db,
            `DELETE FROM poop WHERE id = ?`,
            [localPoop.id]
          );

          // Emit data change event
          dataChangeEmitter.emit({
            type: 'POOP_DELETED',
            data: { poopId: localPoop.id },
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      console.error('Error syncing poop deletions from cloud:', error);
    }
  }

  // 🔥 NEW: Sync deletions from cloud to local
  private async syncDeletionsFromCloud(cloudBottles: any[]): Promise<void> {
    if (!await this.initDatabase() || !this.db) return;

    try {
      // 🔥 FIXED: Get ALL local bottles (not just synced ones) to detect deletions
      // This ensures that even pending bottles that were deleted on another device are removed
      const localBottles = await getAllRows(this.db,
        `SELECT id FROM entries`
      );

      // Create a set of cloud bottle IDs for fast lookup
      const cloudBottleIds = new Set(cloudBottles.map(bottle => bottle.id));

      // Find local bottles that don't exist in cloud anymore (deleted on cloud)
      for (const localBottle of localBottles) {
        if (!cloudBottleIds.has(localBottle.id)) {
          console.log(`🗑️ [CLOUD DELETE SYNC] Bottle ${localBottle.id} deleted on cloud, deleting locally`);
          
          // Delete the local bottle
          await executeQuery(this.db,
            `DELETE FROM entries WHERE id = ?`,
            [localBottle.id]
          );

          // Emit data change event
          dataChangeEmitter.emit({
            type: 'BOTTLE_DELETED',
            data: { bottleId: localBottle.id },
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      console.error('Error syncing deletions from cloud:', error);
    }
  }

  // Sync a poop from cloud to local
  private async syncPoopFromCloud(cloudPoop: any): Promise<void> {
    if (!await this.initDatabase() || !this.db) return;

    try {
      // Check if poop exists locally by unified ID
      const localPoop = await getFirstRow(this.db,
        `SELECT * FROM poop WHERE id = ?`,
        [cloudPoop.id]
      );

      if (localPoop) {
        // Check if data actually changed
        if (localPoop.time !== cloudPoop.time || 
            localPoop.info !== cloudPoop.info) {
          // Update existing poop
          await executeQuery(this.db,
            `UPDATE poop SET 
             time = ?, info = ?, sync_status = ?
             WHERE id = ?`,
            [cloudPoop.time, cloudPoop.info, 'synced', cloudPoop.id]
          );
          console.log(`🔄 Updated existing poop ${cloudPoop.id}`);
        }
        } else {
          // Create new poop
          await executeQuery(this.db,
          `INSERT INTO poop (id, time, info, sync_status)
             VALUES (?, ?, ?, ?)`,
          [cloudPoop.id, cloudPoop.time, cloudPoop.info, 'synced']
          );
          console.log(`➕ Created new poop from cloud ${cloudPoop.id}`);
      }
    } catch (error) {
      console.error('Error syncing poop from cloud:', error);
    }
  }

  // 🔥 NEW: Sync a bottle from cloud to local
  private async syncBottleFromCloud(cloudBottle: any): Promise<void> {
    if (!await this.initDatabase() || !this.db) return;

    try {
      // Check if bottle exists locally by unified ID
      const localBottle = await getFirstRow(this.db,
        `SELECT * FROM entries WHERE id = ?`,
        [cloudBottle.id]
      );

      if (localBottle) {
        // Check if data actually changed
        if (localBottle.amount !== cloudBottle.amount || 
            localBottle.time !== cloudBottle.time ||
            localBottle.color !== cloudBottle.color) {
          // Update existing bottle
          await executeQuery(this.db,
            `UPDATE entries SET 
             amount = ?, time = ?, color = ?, sync_status = ?
             WHERE id = ?`,
            [cloudBottle.amount, cloudBottle.time, cloudBottle.color, 'synced', cloudBottle.id]
          );
          console.log(`🔄 Updated existing bottle ${cloudBottle.id}`);
        }
      } else {
        // Create new bottle
        await executeQuery(this.db,
          `INSERT INTO entries (id, amount, time, color, sync_status)
             VALUES (?, ?, ?, ?, ?)`,
          [cloudBottle.id, cloudBottle.amount, cloudBottle.time, cloudBottle.color, 'synced']
        );
        console.log(`➕ Created new bottle from cloud ${cloudBottle.id}`);
      }
    } catch (error) {
      console.error('Error syncing bottle from cloud:', error);
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<{ pending: number; synced: number; local: number }> {
    if (!await this.initDatabase() || !this.db) return { pending: 0, synced: 0, local: 0 };

    try {
      const pending = await getFirstRow(this.db,
        `SELECT COUNT(*) as count FROM entries WHERE sync_status = 'pending'`
      );
      
      const synced = await getFirstRow(this.db,
        `SELECT COUNT(*) as count FROM entries WHERE sync_status = 'synced'`
      );
      
      const local = await getFirstRow(this.db,
        `SELECT COUNT(*) as count FROM entries WHERE sync_status = 'local'`
      );

      return {
        pending: pending?.count || 0,
        synced: synced?.count || 0,
        local: local?.count || 0
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return { pending: 0, synced: 0, local: 0 };
    }
  }

  // 🔥 NEW: Clear all data and sync from cloud (cleanup function)
  async clearAllDataAndSyncFromCloud(): Promise<boolean> {
    try {
      console.log('🧹 [CLEANUP] Starting cleanup and cloud sync...');
      
      // Ensure database is initialized
      if (!await this.initDatabase() || !this.db) {
        console.error('❌ [CLEANUP] Database not initialized');
        return false;
      }

      // 🔥 STEP 1: Clear all bottles and poops locally (keep settings)
      console.log('🧹 [CLEANUP] Clearing all bottles and poops...');
      
      // Clear bottles
      await executeQuery(this.db, 'DELETE FROM entries');
      console.log('✅ [CLEANUP] All bottles cleared locally');
      
      // Clear poops
      await executeQuery(this.db, 'DELETE FROM poop');
      console.log('✅ [CLEANUP] All poops cleared locally');
      
      // 🔥 STEP 2: Sync from cloud to get clean data
      console.log('🔄 [CLEANUP] Syncing clean data from cloud...');
      await this.syncFromCloud();
      
      // 🔥 STEP 3: Emit data change event to refresh UI
      this.emitDataChangeEvent('DATA_CLEARED', { message: 'All data cleared and synced from cloud' });
      
      console.log('🎉 [CLEANUP] Cleanup and cloud sync completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ [CLEANUP] Error during cleanup and cloud sync:', error);
      return false;
    }
  }

  // 🔥 NEW: Clear all data WITHOUT syncing from cloud (for logout)
  async clearAllDataOnly(): Promise<boolean> {
    try {
      console.log('🧹 [CLEANUP] Starting data cleanup (logout)...');
      
      // Ensure database is initialized
      if (!await this.initDatabase() || !this.db) {
        console.error('❌ [CLEANUP] Database not initialized');
        return false;
      }

      // 🔥 STEP 1: Clear all bottles and poops locally
      console.log('🧹 [CLEANUP] Clearing all bottles and poops...');
      
      // Clear bottles
      await executeQuery(this.db, 'DELETE FROM entries');
      console.log('✅ [CLEANUP] All bottles cleared locally');
      
      // Clear poops
      await executeQuery(this.db, 'DELETE FROM poop');
      console.log('✅ [CLEANUP] All poops cleared locally');
      
      // 🔥 STEP 2: Emit data change event to refresh UI
      this.emitDataChangeEvent('DATA_CLEARED', { message: 'All data cleared for logout' });
      
      console.log('🎉 [CLEANUP] Data cleanup completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ [CLEANUP] Error during data cleanup:', error);
      return false;
    }
  }

  // 🔥 NEW: Emit data change event helper
  private emitDataChangeEvent(type: string, data: any): void {
    dataChangeEmitter.emit({
      type: type as any,
      data,
      timestamp: Date.now()
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!await this.initDatabase() || !this.db) return false;
      
      // Test all tables
      const tables = ['groups', 'entries', 'poop', 'user_messages', 'languages'];
      for (const table of tables) {
        await this.db.execAsync(`SELECT 1 FROM ${table} LIMIT 1`);
      }
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // ✅ Initialize sync after authentication
  async initializeAfterAuth(): Promise<void> {
    console.log('🔐 [DATABASE] Initializing sync after authentication...');
    
    // Initialize sync only if we have a token
    const authToken = await AsyncStorage.getItem('authToken');
    if (authToken) {
      const syncService = getSyncService();
      if (syncService) {
        await syncService.initializeAfterAuth();
        console.log('✅ [DATABASE] Sync initialized successfully');
      } else {
        console.warn('⚠️ [DATABASE] SyncService not available');
      }
    }
  }

  // 🔥 NEW: Drop all tables (for testing/debugging)
  async dropAllTables(): Promise<boolean> {
    try {
      console.log('🗑️ [DEBUG] Dropping all tables...');
      
      if (!await this.initDatabase() || !this.db) {
        console.error('❌ [DEBUG] Database not available');
        return false;
      }
      
      // Drop tables in correct order (respecting foreign keys)
      await executeQuery(this.db, 'DROP TABLE IF EXISTS poop');
      console.log('✅ [DEBUG] Poop table dropped');
      
      await executeQuery(this.db, 'DROP TABLE IF EXISTS entries');
      console.log('✅ [DEBUG] Entries (bottles) table dropped');
      
      await executeQuery(this.db, 'DROP TABLE IF EXISTS deleted_items');
      console.log('✅ [DEBUG] Deleted_items table dropped');
      
      await executeQuery(this.db, 'DROP TABLE IF EXISTS groups');
      console.log('✅ [DEBUG] Groups table dropped');
      
      await executeQuery(this.db, 'DROP TABLE IF EXISTS group_members');
      console.log('✅ [DEBUG] Group_members table dropped');
      
      await executeQuery(this.db, 'DROP TABLE IF EXISTS group_settings');
      console.log('✅ [DEBUG] Group_settings table dropped');
      
      // Reset database instance
      this.db = null;
      
      console.log('🎉 [DEBUG] All tables dropped successfully');
      return true;
    } catch (error) {
      console.error('❌ [DEBUG] Error dropping tables:', error);
      return false;
    }
  }
}

// Export singleton instance
const databaseService = DatabaseService.getInstance();

// 🔥 NEW: Register the instance for callback configuration
setDatabaseServiceInstance(databaseService);

export default databaseService; 
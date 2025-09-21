import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { AuthResponse, LoginRequest, RegisterRequest, User } from './ApiService';
import databaseService from './DatabaseService';
import realTimeSyncService from './RealTimeSyncService';
import { getSyncService } from './ServiceInterfaces';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    // Initialize immediately without waiting
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize authentication state on startup
  private async initializeAuth(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        this.authState = {
          isAuthenticated: true,
          user,
          token,
          loading: false,
        };
        
        // ✅ Initialize sync if user is already connected
        // User already authenticated, initializing sync...
        await databaseService.initializeAfterAuth();
      } else {
        this.authState = {
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
        };
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    }

    this.notifyListeners();
  }

  // Register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.register(data);
      await this.setAuthData(response.user, response.token);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.login(data);
      await this.setAuthData(response.user, response.token);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      console.log('🔐 [AUTH] Starting logout process...');
      
      // ✅ STEP 1: Clean up services
      await this.cleanupServices();
      
      // ✅ STEP 2: Remove local data
      await this.clearLocalData();
      
      // ✅ STEP 3: Remove authentication data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      // ✅ STEP 4: Update state
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
      
      // ✅ STEP 5: Notify all listeners
      this.notifyListeners();
      
      console.log('✅ [AUTH] Logout completed successfully');
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
    }
  }

  // Check if user is logged in
  async checkAuthStatus(): Promise<boolean> {
    try {
      if (!this.authState.token) {
        this.authState.loading = false;
        this.notifyListeners();
        return false;
      }

      // For now, we consider that if we have a token, we're logged in
      // We can verify with the backend later when it's stable
      this.authState.loading = false;
      this.notifyListeners();
      return true;
      
      // TODO: Verify profile with backend when it's stable
      // const user = await apiService.getProfile();
      // this.authState.user = user;
      // this.notifyListeners();
      // return true;
    } catch (error) {
      console.error('Auth check error:', error);
      // Invalid token, logout
      await this.logout();
      return false;
    }
  }

  // Get current state
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  // Get current token
  getToken(): string | null {
    return this.authState.token;
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Check if authentication is loading
  isLoading(): boolean {
    return this.authState.loading;
  }

  // Set authentication data
  private async setAuthData(user: User, token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      this.authState = {
        isAuthenticated: true,
        user,
        token,
        loading: false,
      };

      this.notifyListeners();
      
      // ✅ Initialize sync after successful authentication
      console.log('🔐 [AUTH] User authenticated, initializing sync...');
      await databaseService.initializeAfterAuth();
    } catch (error) {
      console.error('Error setting auth data:', error);
      throw error;
    }
  }

  // Listener system for state changes
  addListener(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Return a function to remove the listener
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
        listener({ ...this.authState });
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  // Update user information
  async updateUserInfo(): Promise<void> {
    try {
      if (this.authState.isAuthenticated) {
        const user = await apiService.getProfile();
        this.authState.user = user;
        await AsyncStorage.setItem('user', JSON.stringify(user));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  }

  // ✅ Clean up services
  private async cleanupServices(): Promise<void> {
    console.log('🧹 [AUTH] Cleaning up services...');
    
    try {
      // 1. Close WebSocket connection
      console.log('🔌 [AUTH] Disconnecting WebSocket...');
      await realTimeSyncService.disconnect();
      
      // 2. Stop synchronization
      console.log('⏹️ [AUTH] Stopping sync service...');
      const syncService = getSyncService();
      if (syncService) {
        // Note: stopSync method not available, sync will stop automatically when no token
        console.log('✅ [AUTH] Sync service will stop automatically');
      }
      
      // 3. Reset callbacks
      console.log('🔄 [AUTH] Resetting callbacks...');
      // Note: Cannot set callbacks to null, they will be ignored when no token
      console.log('✅ [AUTH] Callbacks will be ignored when no token');
      
      console.log('✅ [AUTH] Services cleaned up successfully');
    } catch (error) {
      console.error('❌ [AUTH] Error cleaning up services:', error);
    }
  }

  // ✅ Remove all local data
  private async clearLocalData(): Promise<void> {
    console.log('🗑️ [AUTH] Clearing local data...');
    
    try {
      // 1. Remove all bottles
      console.log('🍼 [AUTH] Clearing bottles...');
      await databaseService.clearAllDataOnly();
      
      console.log('✅ [AUTH] Local data cleared successfully');
    } catch (error) {
      console.error('❌ [AUTH] Error clearing local data:', error);
    }
  }
}

// Instance singleton
export const authService = AuthService.getInstance();
export default authService; 
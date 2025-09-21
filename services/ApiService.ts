import { API_CONFIG } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}


export interface Bottle {
  id: string;
  group_id: number;
  user_id: number;
  amount: number;
  time: string;
  color: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  isShared?: boolean;
}

export interface CreateBottleRequest {
  id: string;
  amount: number;
  time: string;
  color?: string;
}

export interface UpdateBottleRequest {
  amount: number;
  time: string;
  color: string;
}

export interface Poop {
  id: string;
  group_id: number;
  user_id: number;
  time: string;
  info: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface CreatePoopRequest {
  id: string;
  time: string;
  info?: string | null;
  color?: string;
}

export interface UpdatePoopRequest {
  time: string;
  info: string | null;
  color?: string;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string = API_CONFIG.BASE_URL;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token JWT
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Expired or invalid token
          AsyncStorage.removeItem('authToken');
          AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', data);
    return response.data;
  }

  async getProfile(): Promise<User> {
    console.log('🔍 [DEBUG] ApiService.getProfile() called');
    const response: AxiosResponse<{ user: User }> = await this.api.get('/auth/profile');
    console.log('🔍 [DEBUG] ApiService.getProfile() success:', response.data);
    return response.data.user;
  }

  // Bottle methods
  async createBottle(data: CreateBottleRequest): Promise<Bottle> {
    const response: AxiosResponse<{ message: string; bottle: Bottle }> = await this.api.post('/bottles', data);
    return response.data.bottle;
  }

  async getBottles(limit: number = 50, since?: string): Promise<{ bottles: Bottle[]; total: number }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (since) {
      params.append('since', since);
    }
    
    const response: AxiosResponse<{ bottles: Bottle[]; total: number; limit: number; offset: number }> = await this.api.get(`/bottles?${params.toString()}`);
    return {
      bottles: response.data.bottles,
      total: response.data.total
    };
  }

  async getTodayBottles(): Promise<{ bottles: Bottle[]; totalAmount: number; count: number }> {
    const response: AxiosResponse<{ bottles: Bottle[]; totalAmount: number; count: number }> = await this.api.get(`/bottles/today`);
    return response.data;
  }

  async updateBottle(bottleId: string, data: UpdateBottleRequest): Promise<Bottle> {
    const response: AxiosResponse<{ message: string; bottle: Bottle }> = await this.api.put(`/bottles/${bottleId}`, data);
    return response.data.bottle;
  }

  async deleteBottle(bottleId: string): Promise<void> {
    await this.api.delete(`/bottles/${bottleId}`);
  }

  async getBottleStats(period: string = '7d'): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/bottles/stats?period=${period}`);
    return response.data;
  }

  // Poop methods
  async createPoop(data: CreatePoopRequest): Promise<Poop> {
    const response: AxiosResponse<{ message: string; poop: Poop }> = await this.api.post('/poops', data);
    return response.data.poop;
  }

  async getPoops(limit: number = 50, since?: string): Promise<{ poops: Poop[]; total: number }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (since) {
      params.append('since', since);
    }
    
    const response: AxiosResponse<{ poops: Poop[]; total: number; limit: number; offset: number }> = await this.api.get(`/poops?${params.toString()}`);
    return {
      poops: response.data.poops,
      total: response.data.total
    };
  }

  async getTodayPoops(): Promise<{ poops: Poop[]; count: number }> {
    const response: AxiosResponse<{ poops: Poop[]; count: number }> = await this.api.get(`/poops/today`);
    return response.data;
  }

  async updatePoop(poopId: string, data: UpdatePoopRequest): Promise<Poop> {
    const response: AxiosResponse<{ message: string; poop: Poop }> = await this.api.put(`/poops/${poopId}`, data);
    return response.data.poop;
  }

  async deletePoop(poopId: string): Promise<void> {
    await this.api.delete(`/poops/${poopId}`);
  }

  async getPoopStats(period: string = '7d'): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get(`/poops/stats?period=${period}`);
    return response.data;
  }

  // Utility methods
  async isConnected(): Promise<boolean> {
    try {
      await this.api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Password reset methods
  async sendResetCode(email: string): Promise<{ message: string; debugCode?: string }> {
    const response: AxiosResponse<{ message: string; debugCode?: string }> = await this.api.post('/auth/send-reset-code', { email });
    return response.data;
  }

  async verifyResetCode(email: string, code: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/verify-reset-code', { email, code });
    return response.data;
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/reset-password', {
      email,
      code,
      newPassword
    });
    return response.data;
  }

  // Method to change base URL (for testing or deployment)
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.api.defaults.baseURL = `${url}/api`;
  }
}

// Instance singleton
export const apiService = new ApiService();
export default apiService; 
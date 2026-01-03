import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import notificationService from './notificationService';
import healthApiService from './healthApiService';

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';

class AuthService {
  private token: string | null = null;
  private userId: string | null = null;

  async init() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      
      console.log('[AuthService] Init - Token exists:', !!token, 'UserId:', userId);
      
      if (token) {
        this.setSession(token, userId);
        console.log('[AuthService] Session set, healthApiService authenticated:', healthApiService.isAuthenticated());
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  setSession(token: string, userId: string | null) {
    this.token = token;
    this.userId = userId;
    
    console.log('[AuthService] setSession called, token length:', token?.length);
    
    // Update other services
    notificationService.setToken(token);
    if (userId) {
      notificationService.setUserId(userId);
    }
    
    healthApiService.setToken(token);
    console.log('[AuthService] healthApiService token set, isAuthenticated:', healthApiService.isAuthenticated());
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
        if (data._id) {
          await AsyncStorage.setItem(USER_ID_KEY, data._id);
        }
        this.setSession(data.token, data._id);
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
        if (data._id) {
          await AsyncStorage.setItem(USER_ID_KEY, data._id);
        }
        this.setSession(data.token, data._id);
        return data;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_ID_KEY);
      this.token = null;
      this.userId = null;
      
      // Clear other services
      notificationService.setUserId(null);
      notificationService.setToken(''); // Or handle null token
      healthApiService.setToken('');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }
}

export default new AuthService();

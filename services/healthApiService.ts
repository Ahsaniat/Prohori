import { HealthData } from './healthConnectService';
import apiClient from './apiClient';

class HealthApiService {
  // Token management is now handled by AuthService -> ApiClient
  // We keep these methods for backward compatibility if other components call them,
  // but they are no-ops or proxies to AuthService effectively (though ApiClient reads directly).
  
  setToken(token: string) {
    // No-op: ApiClient reads from AuthService directly
    console.log('[HealthApiService] setToken called (delegated to AuthService/ApiClient)');
  }

  getToken() {
    // This might be problematic if callers rely on this. 
    // Ideally update callers to use authService.getToken(), but for safety:
    const authService = require('./authService').default; 
    return authService.getToken();
  }

  isAuthenticated() {
    const authService = require('./authService').default;
    const result = !!authService.getToken();
    console.log('[HealthApiService] isAuthenticated called, result:', result);
    return result;
  }

  // Sync health data to backend
  async syncHealthData(healthData: HealthData): Promise<any> {
    if (!this.isAuthenticated()) {
      console.log('Health sync skipped: User not authenticated');
      return null;
    }

    try {
      // 1. Fetch existing data to avoid overwriting manual entries with nulls
      const existingData = await this.getTodayHealthData();
      
      // Helper to prefer new value if valid, else keep old
      const merge = (newValue: any, oldValue: any) => {
        return (newValue !== null && newValue !== undefined) ? newValue : oldValue;
      };

      const payload = {
        // For sensed data, we generally prefer the fresh sensor data if available
        steps: merge(healthData.steps, existingData?.steps),
        distance: merge(healthData.distance, existingData?.distance),
        calories_burned: merge(healthData.calories_burned, existingData?.calories_burned),
        active_minutes: merge(healthData.active_minutes, existingData?.active_minutes),
        heart_rate_avg: merge(healthData.heart_rate_avg, existingData?.heart_rate_avg),
        heart_rate_max: merge(healthData.heart_rate_max, existingData?.heart_rate_max),
        heart_rate_min: merge(healthData.heart_rate_min, existingData?.heart_rate_min),
        resting_heart_rate: merge(healthData.resting_heart_rate, existingData?.resting_heart_rate),
        oxygen_saturation: merge(healthData.oxygen_saturation, existingData?.oxygen_saturation),
        
        // For manually editable data (or hybrid), we MUST preserve existing if new is null
        height: merge(healthData.height, existingData?.height),
        sleep_hours: merge(healthData.sleep_hours, existingData?.sleep_hours),
        sleep_quality: merge(healthData.sleep_quality, existingData?.sleep_quality),
        water_intake: merge(healthData.water_intake, existingData?.water_intake),
        weight: merge(healthData.weight, existingData?.weight),
        
        blood_pressure_systolic: merge(healthData.blood_pressure_systolic, existingData?.blood_pressure_systolic),
        blood_pressure_diastolic: merge(healthData.blood_pressure_diastolic, existingData?.blood_pressure_diastolic),
        
        metadata: {
          oxygenSaturation: merge(healthData.oxygen_saturation, existingData?.metadata?.oxygenSaturation),
          restingHeartRate: merge(healthData.resting_heart_rate, existingData?.metadata?.restingHeartRate),
          height: merge(healthData.height, existingData?.metadata?.height),
          lastSyncTime: healthData.last_sync_time,
          source: 'health_connect',
        },
      };

      console.log('[HealthApiService] Syncing merged payload...');
      return await apiClient.post('/user/health', payload);
    } catch (error) {
      console.error('Error syncing health data:', error);
      throw error;
    }
  }

  // Get health data from backend
  async getHealthData(date?: string): Promise<any[]> {
    if (!this.isAuthenticated()) {
      console.log('Health data fetch skipped: User not authenticated');
      return [];
    }

    try {
      const endpoint = date 
        ? `/user/health?date=${date}` 
        : `/user/health`;

      return await apiClient.get<any[]>(endpoint);
    } catch (error) {
      console.error('Error fetching health data:', error);
      throw error;
    }
  }

  // Get today's health data from backend
  async getTodayHealthData(): Promise<any | null> {
    try {
      const data = await this.getHealthData();
      if (data && Array.isArray(data) && data.length > 0) {
        // Return the most recent entry
        return data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching today health data:', error);
      return null;
    }
  }

  // Delete health data entry
  async deleteHealthData(id: string): Promise<void> {
    if (!this.isAuthenticated()) return;

    try {
      await apiClient.delete(`/user/health/${id}`);
    } catch (error) {
      console.error('Error deleting health data:', error);
      throw error;
    }
  }

  // Update health data entry
  async updateHealthData(id: string, data: Partial<HealthData>): Promise<any> {
    if (!this.isAuthenticated()) return null;

    try {
      return await apiClient.put(`/user/health/${id}`, data);
    } catch (error) {
      console.error('Error updating health data:', error);
      throw error;
    }
  }

  // Save manual health data (creates or updates via POST)
  async saveManualData(data: Partial<HealthData>): Promise<any> {
    if (!this.isAuthenticated()) {
      console.log('Health data save skipped: User not authenticated');
      return null;
    }

    try {
      // Add metadata to indicate manual source
      const payload = {
        ...data,
        metadata: {
          ...((data as any).metadata || {}),
          source: 'manual',
          lastSyncTime: new Date().toISOString()
        }
      };

      return await apiClient.post('/user/health', payload);
    } catch (error) {
      console.error('Error saving manual health data:', error);
      throw error;
    }
  }
}

export default new HealthApiService();

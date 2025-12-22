import { create } from 'zustand';
import { Platform, AppState } from 'react-native';
import healthConnectService, { HealthData } from '../services/healthConnectService';
import healthApiService from '../services/healthApiService';

interface HealthState {
  // State
  healthData: HealthData | null;      // From Health Connect
  dbHealthData: any | null;           // From Backend DB
  displayData: any | null;            // Merged/Active data for UI
  
  isHealthConnectAvailable: boolean | null;
  permissionsGranted: boolean;
  permissions: { [key: string]: boolean };
  
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncTime: number | null;

  // Actions
  checkAvailability: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  openSettings: () => void;
  
  fetchFromDB: () => Promise<void>;
  syncData: () => Promise<void>;
  updateLocalData: (key: keyof HealthData, value: number) => Promise<void>;
  
  reset: () => void;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  healthData: null,
  dbHealthData: null,
  displayData: null,
  
  isHealthConnectAvailable: null,
  permissionsGranted: false,
  permissions: {},
  
  isLoading: false,
  isSyncing: false,
  error: null,
  lastSyncTime: null,

  reset: () => set({
    healthData: null,
    dbHealthData: null,
    displayData: null,
    isSyncing: false,
    error: null,
    permissions: {}
  }),

  checkAvailability: async () => {
    if (Platform.OS !== 'android') {
      set({ isHealthConnectAvailable: false });
      return;
    }

    try {
      const available = await healthConnectService.isAvailable();
      set({ isHealthConnectAvailable: available });

      if (available) {
        const initialized = await healthConnectService.init();
        if (initialized) {
          const permissions = await healthConnectService.checkPermissions();
          const hasAnyPermission = Object.values(permissions).some(Boolean);
          set({ 
            permissionsGranted: hasAnyPermission,
            permissions: permissions
          });
        }
      }
    } catch (err) {
      console.error('[HealthStore] checkAvailability error:', err);
    }
  },

  requestPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const granted = await healthConnectService.requestPermissions();
      // After request, re-check details
      const permissions = await healthConnectService.checkPermissions();
      const hasAnyPermission = Object.values(permissions).some(Boolean);
      
      set({ 
        permissionsGranted: hasAnyPermission, 
        permissions: permissions,
        isLoading: false 
      });
      
      if (granted) {
        // Trigger sync immediately after granting
        get().syncData();
      }
      return granted;
    } catch (err) {
      console.error('[HealthStore] requestPermissions error:', err);
      set({ error: 'Failed to request permissions', isLoading: false });
      return false;
    }
  },

  openSettings: () => {
    healthConnectService.openSettings();
  },

  fetchFromDB: async () => {
    // We don't set global loading here to avoid full screen spinners on background fetches
    if (!healthApiService.isAuthenticated()) {
      console.log('[HealthStore] Not authenticated, skipping DB fetch');
      return;
    }

    try {
      console.log('[HealthStore] Fetching from DB...');
      const data = await healthApiService.getTodayHealthData();
      
      if (data) {
        // Normalize
        const normalizedData = {
          ...data,
          resting_heart_rate: data.resting_heart_rate || data.metadata?.restingHeartRate,
          oxygen_saturation: data.oxygen_saturation || data.metadata?.oxygenSaturation,
          height: data.height || data.metadata?.height,
          last_sync_time: data.last_sync_time || data.metadata?.lastSyncTime || data.updated_at,
        };
        
        // Merge: HC takes priority if available
        const currentHC = get().healthData;
        // Start with DB data
        const merged = { ...normalizedData };
        
        // Only apply HC values if they are valid (not null/undefined)
        if (currentHC) {
            Object.keys(currentHC).forEach(key => {
                const val = currentHC[key as keyof HealthData];
                if (val !== null && val !== undefined) {
                    merged[key] = val;
                }
            });
        }

        set({ 
          dbHealthData: normalizedData,
          displayData: merged
        });
      }
    } catch (err) {
      console.error('[HealthStore] fetchFromDB error:', err);
      // Keep existing data if fetch fails
    }
  },

  syncData: async () => {
    const { isHealthConnectAvailable, permissionsGranted, isSyncing } = get();
    
    if (!isHealthConnectAvailable || !permissionsGranted) return;
    if (isSyncing) return;
    if (!healthApiService.isAuthenticated()) return;

    set({ isSyncing: true, error: null });

    try {
      // 1. Read Health Connect
      const hcData = await healthConnectService.fetchAllHealthData();
      
      // Update UI immediately with fresh HC data merged with existing DB data
      const currentDB = get().dbHealthData;
      // Start with DB data (if exists), otherwise HC data (with nulls)
      const merged = currentDB ? { ...currentDB } : { ...hcData };
      
      if (currentDB) {
          // If we have DB data, overlay HC data ONLY where HC is valid
          Object.keys(hcData).forEach(key => {
              const val = hcData[key as keyof HealthData];
              if (val !== null && val !== undefined) {
                  merged[key] = val;
              }
              // If val is null, we do nothing, preserving currentDB[key]
          });
      }

      set({ 
          healthData: hcData,
          displayData: merged 
      });

      // 2. Sync to Backend
      const syncResult = await healthApiService.syncHealthData(hcData);
      
      if (syncResult) {
        console.log('[HealthStore] Sync successful');
        set({ lastSyncTime: Date.now() });
        // 3. Refresh DB data to ensure UI matches server state (but keep HC priority if needed)
        // We delay this slightly or rely on the fact that fetchFromDB also merges
        await get().fetchFromDB();
      }
    } catch (err: any) {
      console.error('[HealthStore] syncData error:', err);
    } finally {
      set({ isSyncing: false });
    }
  },

  updateLocalData: async (key: keyof HealthData, value: number) => {
    const { dbHealthData, isHealthConnectAvailable, permissionsGranted } = get();
    
    // 1. Optimistic UI Update
    const updatePayload: any = { [key]: value };
    if (key === 'sleep_hours') {
      let quality = 'Unknown';
      if (value >= 7) quality = 'Good';
      else if (value >= 5) quality = 'Fair';
      else if (value > 0) quality = 'Poor';
      updatePayload.sleep_quality = quality;
    }

    // Update display data immediately
    set(state => ({
      displayData: {
        ...state.displayData,
        ...updatePayload
      }
    }));

    try {
      let hcSuccess = false;
      
      // 2. Try Health Connect Write
      if (isHealthConnectAvailable && permissionsGranted) {
        switch (key) {
          case 'weight':
            hcSuccess = await healthConnectService.writeWeight(value);
            break;
          case 'height':
            hcSuccess = await healthConnectService.writeHeight(value);
            break;
          case 'water_intake':
            hcSuccess = await healthConnectService.writeHydration(value);
            break;
          case 'sleep_hours':
            hcSuccess = await healthConnectService.writeSleep(value);
            break;
        }
      }

      // 3. Sync or Direct Save
      if (hcSuccess) {
        await get().syncData();
      } else {
        await healthApiService.saveManualData(updatePayload);
        await get().fetchFromDB();
      }
    } catch (err) {
      console.error('[HealthStore] updateLocalData error:', err);
      // Revert on error by refetching
      await get().fetchFromDB();
    }
  }
}));

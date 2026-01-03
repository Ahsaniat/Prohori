import {
  initialize,
  requestPermission,
  readRecords,
  insertRecords,
  getGrantedPermissions,
  getSdkStatus,
  openHealthConnectSettings,
  aggregateRecord,
} from 'react-native-health-connect';
import { Platform } from 'react-native';

// Health data types we want to read
const HEALTH_PERMISSIONS = [
  { accessType: 'read' as const, recordType: 'Steps' as const },
  { accessType: 'read' as const, recordType: 'Distance' as const },
  { accessType: 'read' as const, recordType: 'ActiveCaloriesBurned' as const },
  { accessType: 'read' as const, recordType: 'TotalCaloriesBurned' as const },
  { accessType: 'read' as const, recordType: 'HeartRate' as const },
  { accessType: 'read' as const, recordType: 'RestingHeartRate' as const },
  { accessType: 'read' as const, recordType: 'OxygenSaturation' as const },
  { accessType: 'read' as const, recordType: 'SleepSession' as const },
  { accessType: 'write' as const, recordType: 'SleepSession' as const },
  { accessType: 'read' as const, recordType: 'Weight' as const },
  { accessType: 'write' as const, recordType: 'Weight' as const },
  { accessType: 'read' as const, recordType: 'Height' as const },
  { accessType: 'write' as const, recordType: 'Height' as const },
  { accessType: 'read' as const, recordType: 'Hydration' as const },
  { accessType: 'write' as const, recordType: 'Hydration' as const },
  { accessType: 'read' as const, recordType: 'BloodPressure' as const },
  { accessType: 'read' as const, recordType: 'ExerciseSession' as const },
];

export interface HealthData {
  steps: number | null;
  distance: number | null;
  calories_burned: number | null;
  active_minutes: number | null;
  heart_rate_avg: number | null;
  heart_rate_min: number | null;
  heart_rate_max: number | null;
  resting_heart_rate: number | null;
  oxygen_saturation: number | null;
  sleep_hours: number | null;
  sleep_quality: string | null;
  weight: number | null;
  height: number | null;
  water_intake: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  last_sync_time: string;
}

class HealthConnectService {
  private isInitialized = false;

  // Check if Health Connect is available on this device
  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('Health Connect is only available on Android');
      return false;
    }

    try {
      const status = await getSdkStatus();
      return status === 3; // SDK_AVAILABLE = 3
    } catch (error) {
      console.error('Error checking Health Connect availability:', error);
      return false;
    }
  }

  // Initialize Health Connect client
  async init(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (Platform.OS !== 'android') {
      console.log('Health Connect is only available on Android');
      return false;
    }

    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        console.log('Health Connect is not available on this device');
        return false;
      }

      this.isInitialized = await initialize();
      return this.isInitialized;
    } catch (error) {
      console.error('Error initializing Health Connect:', error);
      return false;
    }
  }

  // Request permissions for health data
  async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.init();
        if (!initialized) return false;
      }

      const granted = await requestPermission(HEALTH_PERMISSIONS);
      return granted.length > 0;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Check if specific permissions are granted (both read and write)
  async checkPermissions(): Promise<{ [key: string]: boolean }> {
    const permissions: { [key: string]: boolean } = {};

    try {
      const granted = await getGrantedPermissions();
      
      // Build a set of "accessType:recordType" strings for quick lookup
      const grantedSet = new Set(
        granted.map((p: any) => `${p.accessType}:${p.recordType}`)
      );

      HEALTH_PERMISSIONS.forEach((perm) => {
        const key = perm.accessType === 'write' 
          ? `write_${perm.recordType}` 
          : perm.recordType;
        permissions[key] = grantedSet.has(`${perm.accessType}:${perm.recordType}`);
      });
      
      // Also keep backward compatibility - mark recordType as true if ANY permission exists
      HEALTH_PERMISSIONS.forEach((perm) => {
        if (!permissions[perm.recordType]) {
          permissions[perm.recordType] = grantedSet.has(`read:${perm.recordType}`) || 
                                          grantedSet.has(`write:${perm.recordType}`);
        }
      });
      
      console.log('[HealthConnect] Permissions check:', JSON.stringify(permissions));
    } catch (error) {
      console.error('Error checking permissions:', error);
    }

    return permissions;
  }

  // Open Health Connect settings
  async openSettings(): Promise<void> {
    try {
      await openHealthConnectSettings();
    } catch (error) {
      console.error('Error opening Health Connect settings:', error);
    }
  }

  // Get time range filter for today
  private getTodayTimeRange() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const range = {
      operator: 'between' as const,
      startTime: startOfDay.toISOString(),
      endTime: now.toISOString(),
    };
    console.log(`[HealthConnect] Today Range: ${range.startTime} - ${range.endTime}`);
    return range;
  }

  // Get time range for the past 24 hours
  private get24HourTimeRange() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const range = {
      operator: 'between' as const,
      startTime: yesterday.toISOString(),
      endTime: now.toISOString(),
    };
    console.log(`[HealthConnect] 24h Range: ${range.startTime} - ${range.endTime}`);
    return range;
  }

  // Read steps data
  async readSteps(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['Steps']) {
        console.log('[HealthConnect] Permission for Steps denied');
        return null;
      }

      const result = await aggregateRecord({
        recordType: 'Steps',
        timeRangeFilter: this.getTodayTimeRange(),
      });

      const steps = (result as any)?.COUNT_TOTAL ?? null;
      console.log('[HealthConnect] Read steps:', steps);
      return steps;
    } catch (error) {
      console.error('Error reading steps:', error);
      return null;
    }
  }

  // Read distance data
  async readDistance(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['Distance']) return null;

      const result = await aggregateRecord({
        recordType: 'Distance',
        timeRangeFilter: this.getTodayTimeRange(),
      });

      // Convert meters to kilometers
      const meters = (result as any)?.DISTANCE_TOTAL?.inMeters ?? 0;
      return meters > 0 ? Math.round(meters) / 1000 : null;
    } catch (error) {
      console.error('Error reading distance:', error);
      return null;
    }
  }

  // Read active calories burned
  async readActiveCalories(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['ActiveCaloriesBurned']) {
        console.log('[HealthConnect] Permission for ActiveCaloriesBurned denied');
        return null;
      }

      // Use readRecords instead of aggregateRecord for more reliable results
      const { records } = await readRecords('ActiveCaloriesBurned', {
        timeRangeFilter: this.getTodayTimeRange(),
      });

      if (!records || records.length === 0) {
        console.log('[HealthConnect] No ActiveCaloriesBurned records found');
        return null;
      }

      // Sum up all calories from records
      let totalCalories = 0;
      records.forEach((record: any) => {
        if (record.energy?.inKilocalories) {
          totalCalories += record.energy.inKilocalories;
        }
      });

      const result = totalCalories > 0 ? Math.round(totalCalories) : null;
      console.log(`[HealthConnect] Active Calories found: ${result} kcal from ${records.length} records`);
      return result;
    } catch (error) {
      console.error('[HealthConnect] Error reading active calories:', error);
      return null;
    }
  }

  // Read total calories burned
  async readTotalCalories(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['TotalCaloriesBurned']) {
        console.log('[HealthConnect] Permission for TotalCaloriesBurned denied');
        return null;
      }

      // Use readRecords instead of aggregateRecord for more reliable results
      const { records } = await readRecords('TotalCaloriesBurned', {
        timeRangeFilter: this.getTodayTimeRange(),
      });

      if (!records || records.length === 0) {
        console.log('[HealthConnect] No TotalCaloriesBurned records found');
        return null;
      }

      // Sum up all calories from records
      let totalCalories = 0;
      records.forEach((record: any) => {
        if (record.energy?.inKilocalories) {
          totalCalories += record.energy.inKilocalories;
        }
      });

      const result = totalCalories > 0 ? Math.round(totalCalories) : null;
      console.log(`[HealthConnect] Total Calories found: ${result} kcal from ${records.length} records`);
      return result;
    } catch (error) {
      console.error('[HealthConnect] Error reading total calories:', error);
      return null;
    }
  }

  // Read heart rate data
  async readHeartRate(): Promise<{ avg: number | null; min: number | null; max: number | null }> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['HeartRate']) {
        console.log('[HealthConnect] Permission for HeartRate denied');
        return { avg: null, min: null, max: null };
      }

      const { records } = await readRecords('HeartRate', {
        timeRangeFilter: this.get24HourTimeRange(),
      });

      if (!records || records.length === 0) {
        console.log('[HealthConnect] No heart rate records found');
        return { avg: null, min: null, max: null };
      }

      // Extract all BPM samples
      const allBpm: number[] = [];
      records.forEach((record: any) => {
        if (record.samples) {
          record.samples.forEach((sample: any) => {
            if (sample.beatsPerMinute) {
              allBpm.push(sample.beatsPerMinute);
            }
          });
        }
      });

      if (allBpm.length === 0) {
        return { avg: null, min: null, max: null };
      }

      const avg = Math.round(allBpm.reduce((a, b) => a + b, 0) / allBpm.length);
      const min = Math.min(...allBpm);
      const max = Math.max(...allBpm);

      console.log(`[HealthConnect] Heart Rate - Avg: ${avg}, Min: ${min}, Max: ${max}`);
      return { avg, min, max };
    } catch (error) {
      console.error('Error reading heart rate:', error);
      return { avg: null, min: null, max: null };
    }
  }

  // Read resting heart rate
  async readRestingHeartRate(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['RestingHeartRate']) return null;

      const { records } = await readRecords('RestingHeartRate', {
        timeRangeFilter: this.get24HourTimeRange(),
      });

      if (!records || records.length === 0) return null;

      // Get the latest resting heart rate
      const latest = records[records.length - 1] as any;
      return latest?.beatsPerMinute ?? null;
    } catch (error) {
      console.error('Error reading resting heart rate:', error);
      return null;
    }
  }

  // Read oxygen saturation (SpO2)
  async readOxygenSaturation(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['OxygenSaturation']) {
        console.log('[HealthConnect] Permission for SpO2 denied');
        return null;
      }

      const { records } = await readRecords('OxygenSaturation', {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          endTime: new Date().toISOString(),
        },
      });

      if (!records || records.length === 0) {
        console.log('[HealthConnect] No SpO2 records found in last 30 days');
        return null;
      }

      // Get the latest SpO2 reading
      const latest = records[records.length - 1] as any;
      let val = latest?.percentage ?? null;
      
      if (val !== null) {
        // If percentage is <= 1 (e.g. 0.98), multiply by 100 to get 98.
        // If percentage is > 1 (e.g. 98), assume it's already 0-100.
        if (val <= 1) {
          val = Math.round(val * 100);
        } else {
          val = Math.round(val);
        }
      }
      
      console.log(`[HealthConnect] SpO2 found: ${val}%`);
      return val;
    } catch (error) {
      console.error('Error reading oxygen saturation:', error);
      return null;
    }
  }

  // Read sleep data
  async readSleep(): Promise<{ hours: number | null; quality: string | null }> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['SleepSession']) {
        console.log('[HealthConnect] Permission for SleepSession denied');
        return { hours: null, quality: null };
      }

      // Get sleep data from the past 24 hours
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const { records } = await readRecords('SleepSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: yesterday.toISOString(),
          endTime: now.toISOString(),
        },
      });

      if (!records || records.length === 0) {
        console.log('[HealthConnect] No sleep records found');
        return { hours: null, quality: null };
      }

      // Calculate total sleep duration
      let totalMs = 0;
      records.forEach((record: any) => {
        const start = new Date(record.startTime).getTime();
        const end = new Date(record.endTime).getTime();
        totalMs += end - start;
      });

      const hours = totalMs / (1000 * 60 * 60);
      let quality = 'Unknown';
      if (hours >= 7) quality = 'Good';
      else if (hours >= 5) quality = 'Fair';
      else if (hours > 0) quality = 'Poor';

      console.log(`[HealthConnect] Sleep - Hours: ${hours}, Quality: ${quality}`);
      return { hours: Math.round(hours * 10) / 10, quality };
    } catch (error) {
      console.error('Error reading sleep:', error);
      return { hours: null, quality: null };
    }
  }

  // Read weight data
  async readWeight(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['Weight']) {
        console.log('[HealthConnect] Permission for Weight denied');
        return null;
      }

      const { records } = await readRecords('Weight', {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          endTime: new Date().toISOString(),
        },
      });

      if (!records || records.length === 0) {
        console.log('[HealthConnect] No Weight records found in last 30 days');
        return null;
      }

      // Get the latest weight
      const latest = records[records.length - 1] as any;
      const val = latest?.weight?.inKilograms ?? null;
      console.log(`[HealthConnect] Weight found: ${val}kg`);
      return val;
    } catch (error) {
      console.error('Error reading weight:', error);
      return null;
    }
  }

  // Read height data
  async readHeight(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['Height']) return null;

      const { records } = await readRecords('Height', {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Last year
          endTime: new Date().toISOString(),
        },
      });

      if (!records || records.length === 0) return null;

      // Get the latest height
      const latest = records[records.length - 1] as any;
      return latest?.height?.inMeters ? latest.height.inMeters * 100 : null; // Convert to cm
    } catch (error) {
      console.error('Error reading height:', error);
      return null;
    }
  }

  // Read hydration data
  async readHydration(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['Hydration']) return null;

      const result = await aggregateRecord({
        recordType: 'Hydration',
        timeRangeFilter: this.getTodayTimeRange(),
      });

      // Convert to liters
      const liters = (result as any)?.VOLUME_TOTAL?.inLiters ?? null;
      return liters ? Math.round(liters * 10) / 10 : null;
    } catch (error) {
      console.error('Error reading hydration:', error);
      return null;
    }
  }

  // Read blood pressure
  async readBloodPressure(): Promise<{ systolic: number | null; diastolic: number | null }> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['BloodPressure']) return { systolic: null, diastolic: null };

      const { records } = await readRecords('BloodPressure', {
        timeRangeFilter: this.get24HourTimeRange(),
      });

      if (!records || records.length === 0) {
        return { systolic: null, diastolic: null };
      }

      // Get the latest blood pressure reading
      const latest = records[records.length - 1] as any;
      return {
        systolic: latest?.systolic?.inMillimetersOfMercury ?? null,
        diastolic: latest?.diastolic?.inMillimetersOfMercury ?? null,
      };
    } catch (error) {
      console.error('Error reading blood pressure:', error);
      return { systolic: null, diastolic: null };
    }
  }

  // Read exercise sessions
  async readExerciseMinutes(): Promise<number | null> {
    try {
      const permissions = await this.checkPermissions();
      if (!permissions['ExerciseSession']) return null;

      const { records } = await readRecords('ExerciseSession', {
        timeRangeFilter: this.getTodayTimeRange(),
      });

      if (!records || records.length === 0) return null;

      // Calculate total exercise duration in minutes
      let totalMs = 0;
      records.forEach((record: any) => {
        const start = new Date(record.startTime).getTime();
        const end = new Date(record.endTime).getTime();
        totalMs += end - start;
      });

      return Math.round(totalMs / (1000 * 60));
    } catch (error) {
      console.error('Error reading exercise minutes:', error);
      return null;
    }
  }

  // Fetch all health data
  async fetchAllHealthData(): Promise<HealthData> {
    console.log('[HealthConnect] Starting fetchAllHealthData');
    const [
      steps,
      distance,
      activeCalories,
      totalCalories,
      heartRate,
      restingHeartRate,
      oxygenSaturation,
      sleep,
      weight,
      height,
      hydration,
      bloodPressure,
      exerciseMinutes,
    ] = await Promise.all([
      this.readSteps(),
      this.readDistance(),
      this.readActiveCalories(),
      this.readTotalCalories(),
      this.readHeartRate(),
      this.readRestingHeartRate(),
      this.readOxygenSaturation(),
      this.readSleep(),
      this.readWeight(),
      this.readHeight(),
      this.readHydration(),
      this.readBloodPressure(),
      this.readExerciseMinutes(),
    ]);

    const result = {
      steps,
      distance,
      calories_burned: activeCalories || totalCalories,
      active_minutes: exerciseMinutes,
      heart_rate_avg: heartRate.avg,
      heart_rate_min: heartRate.min,
      heart_rate_max: heartRate.max,
      resting_heart_rate: restingHeartRate,
      oxygen_saturation: oxygenSaturation,
      sleep_hours: sleep.hours,
      sleep_quality: sleep.quality,
      weight,
      height,
      water_intake: hydration,
      blood_pressure_systolic: bloodPressure.systolic,
      blood_pressure_diastolic: bloodPressure.diastolic,
      last_sync_time: new Date().toISOString(),
    };

    console.log('[HealthConnect] fetchAllHealthData result:', JSON.stringify(result));
    return result;
  }

  // Write sleep data
  async writeSleep(hours: number): Promise<boolean> {
    try {
      console.log(`[HealthConnect] writeSleep called with ${hours} hours`);
      const permissions = await this.checkPermissions();
      if (!permissions['write_SleepSession']) {
        console.log('[HealthConnect] Missing WRITE permission for SleepSession');
        return false;
      }
      
      const now = new Date();
      const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
      
      console.log(`[HealthConnect] Inserting SleepSession: ${startTime.toISOString()} - ${now.toISOString()}`);
      const result = await insertRecords([
        {
          recordType: 'SleepSession',
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
        },
      ]);
      console.log(`[HealthConnect] Wrote sleep: ${hours} hours, IDs:`, result);
      return true;
    } catch (error) {
      console.error('[HealthConnect] Error writing sleep:', error);
      return false;
    }
  }

  // Write weight data
  async writeWeight(weightKg: number): Promise<boolean> {
    try {
      console.log(`[HealthConnect] writeWeight called with ${weightKg} kg`);
      const permissions = await this.checkPermissions();
      if (!permissions['write_Weight']) {
        console.log('[HealthConnect] Missing WRITE permission for Weight');
        return false;
      }
      
      console.log(`[HealthConnect] Inserting Weight record: ${weightKg}kg`);
      const result = await insertRecords([
        {
          recordType: 'Weight',
          weight: { value: weightKg, unit: 'kilograms' },
          time: new Date().toISOString(),
        },
      ]);
      console.log(`[HealthConnect] Wrote weight: ${weightKg}kg, IDs:`, result);
      return true;
    } catch (error) {
      console.error('[HealthConnect] Error writing weight:', error);
      if ((error as any).message?.includes('SecurityException')) {
         console.error('[HealthConnect] Missing WRITE_WEIGHT permission!');
      }
      return false;
    }
  }

  // Write height data
  async writeHeight(heightCm: number): Promise<boolean> {
    try {
      console.log(`[HealthConnect] writeHeight called with ${heightCm} cm`);
      const permissions = await this.checkPermissions();
      if (!permissions['write_Height']) {
        console.log('[HealthConnect] Missing WRITE permission for Height');
        return false;
      }
      
      const heightM = heightCm / 100;
      console.log(`[HealthConnect] Inserting Height record: ${heightM}m`);
      const result = await insertRecords([
        {
          recordType: 'Height',
          height: { value: heightM, unit: 'meters' },
          time: new Date().toISOString(),
        },
      ]);
      console.log(`[HealthConnect] Wrote height: ${heightCm}cm, IDs:`, result);
      return true;
    } catch (error) {
      console.error('[HealthConnect] Error writing height:', error);
      if ((error as any).message?.includes('SecurityException')) {
         console.error('[HealthConnect] Missing WRITE_HEIGHT permission!');
      }
      return false;
    }
  }

  // Write hydration data
  async writeHydration(liters: number): Promise<boolean> {
    try {
      console.log(`[HealthConnect] writeHydration called with ${liters} L`);
      const permissions = await this.checkPermissions();
      if (!permissions['write_Hydration']) {
        console.log('[HealthConnect] Missing WRITE permission for Hydration');
        return false;
      }
      
      const now = new Date();
      const startTime = new Date(now.getTime() - 1000); // 1 second duration
      
      console.log(`[HealthConnect] Inserting Hydration record: ${liters}L`);
      const result = await insertRecords([
        {
          recordType: 'Hydration',
          volume: { value: liters, unit: 'liters' },
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
        },
      ]);
      console.log(`[HealthConnect] Wrote hydration: ${liters}L, IDs:`, result);
      return true;
    } catch (error) {
      console.error('[HealthConnect] Error writing hydration:', error);
      return false;
    }
  }
}

export default new HealthConnectService();

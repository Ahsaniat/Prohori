import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform, ActivityIndicator, AppState, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { HealthData } from '../../services/healthConnectService';
import authService from '../../services/authService';
import { useHealthStore } from '../../store/healthStore';

// Sync interval: 2 minutes
const SYNC_INTERVAL_MS = 2 * 60 * 1000;

interface HealthCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  bgColor: string;
  title: string;
  value: string | number | null;
  unit?: string;
  subtitle?: string;
  subtitleColor?: string;
  editable?: boolean;
  onSave?: (value: string) => Promise<void>;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'number-pad' | 'phone-pad' | 'name-phone-pad' | 'decimal-pad' | 'twitter' | 'web-search' | 'visible-password';
}

function HealthCard({ icon, iconColor, bgColor, title, value, unit, subtitle, subtitleColor = 'text-gray-500', editable, onSave, keyboardType = 'numeric' }: HealthCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value?.toString() || '');

  // Update tempValue when value prop changes, but only if not currently editing
  useEffect(() => {
    if (!isEditing && value !== null && value !== undefined) {
      setTempValue(value.toString());
    }
  }, [value, isEditing]);

  const handleSave = async () => {
    if (onSave) {
      await onSave(tempValue);
    }
    setIsEditing(false);
  };

  const displayValue = value !== null && value !== undefined ? value : '--';
  
  return (
    <View className="w-[48%] bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className={`w-8 h-8 rounded-full items-center justify-center ${bgColor}`}>
            <MaterialIcons name={icon} size={18} color={iconColor} />
          </View>
          <Text className="ml-2 text-gray-500 dark:text-gray-400 font-medium text-sm flex-shrink" numberOfLines={1}>{title}</Text>
        </View>
        {editable && !isEditing && (
          <TouchableOpacity onPress={() => { setIsEditing(true); setTempValue(value?.toString() || ''); }}>
            <MaterialIcons name="edit" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      {isEditing ? (
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 text-xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 py-0"
            value={tempValue}
            onChangeText={setTempValue}
            keyboardType={keyboardType}
            autoFocus
            onBlur={() => setIsEditing(false)}
            onSubmitEditing={handleSave}
          />
          {unit && <Text className="ml-1 text-lg text-gray-500 dark:text-gray-400">{unit}</Text>}
          <TouchableOpacity onPress={handleSave} className="ml-2 p-1 bg-green-100 rounded-full">
            <MaterialIcons name="check" size={16} color="#10B981" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row items-baseline">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">{displayValue}</Text>
          {unit && value !== null && <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">{unit}</Text>}
        </View>
      )}
      
      {subtitle && <Text className={`text-xs mt-1 ${subtitleColor}`}>{subtitle}</Text>}
    </View>
  );
}

interface VitalCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string | number | null;
  unit?: string;
  color: string;
}

function VitalCard({ icon, title, value, unit, color }: VitalCardProps) {
  const displayValue = value !== null && value !== undefined ? value : '--';
  
  return (
    <View className="flex-1 bg-white dark:bg-gray-900 p-3 rounded-xl mx-1">
      <MaterialIcons name={icon} size={20} color={color} />
      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</Text>
      <View className="flex-row items-baseline mt-1">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">{displayValue}</Text>
        {unit && value !== null && <Text className="text-xs text-gray-500 ml-1">{unit}</Text>}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  
    // Zustand Store
    const {
      displayData,
      isHealthConnectAvailable,
      permissionsGranted,
      permissions,
      isLoading,
      isSyncing,
      error,
      checkAvailability,
      requestPermissions,
      openSettings,
      fetchFromDB,
      syncData,
      updateLocalData
    } = useHealthStore();
  
    const [isRefreshing, setIsRefreshing] = useState(false);
    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const appState = useRef(AppState.currentState);
  
    // Check if we have essential write permissions (Weight, Height, Sleep)
    const hasWritePermissions = permissionsGranted && (
      permissions['Weight'] && 
      permissions['Height'] && 
      permissions['SleepSession']
    );
  
    // Calculate progress for steps (goal: 10000)
    const stepsGoal = 10000;
    const steps = displayData?.steps ?? null;
    const stepsProgress = steps ? Math.min((steps / stepsGoal) * 100, 100) : 0;
  
    // Calculate calories goal progress (goal: 2000)
    const caloriesGoal = 2000;
    const caloriesBurned = displayData?.calories_burned || 0;
    const caloriesRemaining = Math.max(caloriesGoal - caloriesBurned, 0);
  
    // Refresh handler - manual refresh
    const onRefresh = useCallback(async () => {
      setIsRefreshing(true);
      await syncData(); // This handles HC read -> sync -> DB fetch
      setIsRefreshing(false);
    }, [syncData]);
  
      // Start periodic sync
      const startPeriodicSync = useCallback(() => {
        if (syncIntervalRef.current) {
          // Already running
          return;
        }
        
        // Sync every 2 minutes
        console.log('Starting periodic health sync...');
        // Immediate sync on start
        syncData();
        
        syncIntervalRef.current = setInterval(() => {
          console.log('Periodic health sync triggered');
          syncData();
        }, SYNC_INTERVAL_MS);
      }, [syncData]);
    
      // Stop periodic sync
      const stopPeriodicSync = useCallback(() => {
        if (syncIntervalRef.current) {
          console.log('Stopping periodic health sync');
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
      }, []);
    
      // Handle app state changes (pause sync when app is in background)
      useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
          if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            // App came to foreground - sync immediately and restart periodic sync if permissions allowed
            console.log('App foregrounded, syncing health data');
            syncData();
            if (permissionsGranted) {
              startPeriodicSync();
            }
          } else if (nextAppState.match(/inactive|background/)) {
            // App went to background - stop periodic sync to save battery
            stopPeriodicSync();
          }
          appState.current = nextAppState;
        });
    
        return () => {
          subscription.remove();
        };
      }, [permissionsGranted, startPeriodicSync, stopPeriodicSync, syncData]);
    
        // Manage periodic sync lifecycle based on permissions
        useEffect(() => {
          if (permissionsGranted) {
            startPeriodicSync();
          }
          
          // Cleanup on unmount or when permissions revoked
          return () => {
            stopPeriodicSync();
          };
        }, [permissionsGranted, startPeriodicSync, stopPeriodicSync]);
      
        // Initial load
        useEffect(() => {
          const init = async () => {
            // First try to fetch existing data from DB (immediate display)
            await fetchFromDB();
            // Then check Health Connect availability
            await checkAvailability();
          };
          init();
        }, [fetchFromDB, checkAvailability]);    // Health Connect not available UI
    const renderHealthConnectUnavailable = () => (
      <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl mb-4">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="warning" size={24} color="#EAB308" />
          <Text className="ml-2 text-yellow-700 dark:text-yellow-400 font-semibold">Health Connect Unavailable</Text>
        </View>
        <Text className="text-yellow-600 dark:text-yellow-300 text-sm">
          {Platform.OS !== 'android' 
            ? 'Health Connect is only available on Android devices.'
            : 'Please install Health Connect from the Play Store to sync your health data.'}
        </Text>
      </View>
    );
  
    // Permission request UI
    const renderPermissionRequest = () => (
      <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl mb-4">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="health-and-safety" size={24} color="#9333EA" />
          <Text className="ml-2 text-purple-700 dark:text-purple-400 font-semibold">Connect Your Health Data</Text>
        </View>
        <Text className="text-purple-600 dark:text-purple-300 text-sm mb-4">
          Grant permission to read your health data from connected devices and apps.
        </Text>
        <TouchableOpacity
          onPress={() => requestPermissions()}
          disabled={isLoading}
          className="bg-purple-600 py-3 px-4 rounded-xl flex-row items-center justify-center"
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <MaterialIcons name="sync" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Connect Health Data</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  
    return (
      <ScreenWrapper bg="bg-gray-50 dark:bg-black">
        <ScrollView 
          className="px-4" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View className="mt-4 mb-4 flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity onPress={() => router.push('/screens/notifications')} className="p-2 mr-2">
                <MaterialIcons name="notifications-none" size={24} color="#9333EA" />
              </TouchableOpacity>
              
              {/* Settings Icon: Opens Permission Request to allow upgrading permissions */}
              {isHealthConnectAvailable && (
                <TouchableOpacity onPress={() => requestPermissions()} className="p-2">
                  <MaterialIcons name="settings" size={24} color={hasWritePermissions ? "#9333EA" : "#F59E0B"} />
                </TouchableOpacity>
              )}
            </View>
          </View>
  
          {/* Health Connect Status */}
          {isHealthConnectAvailable === false && renderHealthConnectUnavailable()}
          
          {/* Show Permission Request if completely disconnected OR if partial permissions (missing write) */}
          {isHealthConnectAvailable === true && (!permissionsGranted || !hasWritePermissions) && (
            <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl mb-4">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="health-and-safety" size={24} color="#9333EA" />
                <Text className="ml-2 text-purple-700 dark:text-purple-400 font-semibold">
                  {permissionsGranted ? 'Upgrade Permissions' : 'Connect Your Health Data'}
                </Text>
              </View>
              <Text className="text-purple-600 dark:text-purple-300 text-sm mb-4">
                {permissionsGranted 
                  ? 'We need additional permissions to save your health data (Weight, Height, Sleep).'
                  : 'Grant permission to read and write your health data.'}
              </Text>
              <TouchableOpacity
                onPress={() => requestPermissions()}
                disabled={isLoading}
                className="bg-purple-600 py-3 px-4 rounded-xl flex-row items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="sync" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      {permissionsGranted ? 'Grant Write Access' : 'Connect Health Data'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        {/* Loading state */}
        {isLoading && !displayData && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#9333EA" />
            <Text className="mt-2 text-gray-500 dark:text-gray-400">Loading health data...</Text>
          </View>
        )}

        {/* Syncing indicator */}
        {isSyncing && (
          <View className="flex-row items-center justify-center py-2 mb-2">
            <ActivityIndicator size="small" color="#9333EA" />
            <Text className="ml-2 text-xs text-gray-500 dark:text-gray-400">Syncing...</Text>
          </View>
        )}

        {/* Error state */}
        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl mb-4">
            <Text className="text-red-600 dark:text-red-400">{error}</Text>
          </View>
        )}

        {/* Main Health Cards */}
        <View className="flex-row flex-wrap justify-between">
          <HealthCard
            icon="local-fire-department"
            iconColor="#EF4444"
            bgColor="bg-red-100 dark:bg-red-900/30"
            title="Calories"
            value={caloriesBurned > 0 ? Math.round(caloriesBurned) : null}
            unit="kcal"
            subtitle={caloriesBurned > 0 ? `${caloriesRemaining} left to goal` : 'No data'}
            subtitleColor={caloriesBurned > 0 ? 'text-green-500' : 'text-gray-400'}
          />
          <HealthCard
            icon="directions-walk"
            iconColor="#8B5CF6"
            bgColor="bg-purple-100 dark:bg-purple-900/30"
            title="Steps"
            value={steps}
            subtitle={steps ? `${Math.round(stepsProgress)}% of goal` : 'No data'}
            subtitleColor={steps ? 'text-purple-500' : 'text-gray-400'}
          />
          <HealthCard
            icon="water-drop"
            iconColor="#3B82F6"
            bgColor="bg-blue-100 dark:bg-blue-900/30"
            title="Water"
            value={displayData?.water_intake ?? null}
            unit="L"
            subtitle={displayData?.water_intake ? 'Daily intake' : 'No data'}
            subtitleColor={displayData?.water_intake ? 'text-blue-500' : 'text-gray-400'}
            editable
            onSave={async (val) => updateLocalData('water_intake', parseFloat(val))}
          />
          <HealthCard
            icon="bedtime"
            iconColor="#6366F1"
            bgColor="bg-indigo-100 dark:bg-indigo-900/30"
            title="Sleep"
            value={displayData?.sleep_hours ?? null}
            unit="h"
            subtitle={displayData?.sleep_quality ?? 'No data'}
            subtitleColor={
              displayData?.sleep_quality === 'Good' ? 'text-green-500' :
              displayData?.sleep_quality === 'Fair' ? 'text-yellow-500' :
              displayData?.sleep_quality === 'Poor' ? 'text-red-500' : 'text-gray-400'
            }
            editable
            onSave={async (val) => updateLocalData('sleep_hours', parseFloat(val))}
          />
          <HealthCard
            icon="air"
            iconColor="#06B6D4"
            bgColor="bg-cyan-100 dark:bg-cyan-900/30"
            title="SpO2"
            value={displayData?.oxygen_saturation ?? null}
            unit="%"
            subtitle="Blood Oxygen"
            subtitleColor="text-cyan-500"
          />
          <HealthCard
            icon="monitor-weight"
            iconColor="#8B5CF6"
            bgColor="bg-purple-100 dark:bg-purple-900/30"
            title="Weight"
            value={displayData?.weight?.toFixed(1) ?? null}
            editable
            onSave={async (val) => updateLocalData('weight', parseFloat(val))}
          />
        </View>

        {/* Heart Rate Section */}
        <View className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="favorite" size={20} color="#EF4444" />
            <Text className="ml-2 text-gray-700 dark:text-gray-300 font-semibold">Heart Rate</Text>
          </View>
          <View className="flex-row">
            <VitalCard icon="favorite-border" title="Average" value={displayData?.heart_rate_avg ?? null} unit="bpm" color="#EF4444" />
            <VitalCard icon="arrow-downward" title="Min" value={displayData?.heart_rate_min ?? null} unit="bpm" color="#3B82F6" />
            <VitalCard icon="arrow-upward" title="Max" value={displayData?.heart_rate_max ?? null} unit="bpm" color="#F59E0B" />
          </View>
          {displayData?.resting_heart_rate && (
            <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Resting Heart Rate: <Text className="font-semibold text-gray-700 dark:text-gray-300">{displayData.resting_heart_rate} bpm</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Additional Vitals */}
        <View className="flex-row flex-wrap justify-between">
          <HealthCard
            icon="height"
            iconColor="#10B981"
            bgColor="bg-green-100 dark:bg-green-900/30"
            title="Height"
            value={displayData?.height ? Math.round(displayData.height) : null}
            unit="cm"
            subtitle={displayData?.height ? 'Recorded' : 'No data'}
            subtitleColor={displayData?.height ? 'text-green-500' : 'text-gray-400'}
            editable
            onSave={async (val) => updateLocalData('height', parseFloat(val))}
          />
          <HealthCard
            icon="fitness-center"
            iconColor="#F59E0B"
            bgColor="bg-amber-100 dark:bg-amber-900/30"
            title="Exercise"
            value={displayData?.active_minutes ?? null}
            unit="min"
            subtitle={displayData?.active_minutes ? 'Active time' : 'No data'}
            subtitleColor="text-amber-500"
          />
        </View>

        {/* Blood Pressure */}
        {displayData?.blood_pressure_systolic && displayData?.blood_pressure_diastolic && (
          <View className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3">Blood Pressure</Text>
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 items-center justify-center mr-3">
                <MaterialIcons name="speed" size={18} color="#EC4899" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {displayData.blood_pressure_systolic}/{displayData.blood_pressure_diastolic}
                  <Text className="text-xs font-normal text-gray-500"> mmHg</Text>
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">Latest reading</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Daily Challenge Card */}
        <View className="mt-2 bg-purple-600 rounded-2xl p-6 shadow-md mb-6">
          <Text className="text-white text-xl font-bold mb-2">Daily Challenge</Text>
          <Text className="text-purple-100 mb-4">
            {steps 
              ? `Walk ${Math.max(stepsGoal - steps, 0).toLocaleString()} more steps to reach your daily milestone!`
              : 'Connect your health data to see your daily challenge!'}
          </Text>
          <TouchableOpacity className="bg-white/20 p-3 rounded-lg self-start">
            <Text className="text-white font-bold">View Details</Text>
          </TouchableOpacity>
        </View>

        {/* Last Sync Time */}
        {(displayData?.updated_at || displayData?.metadata?.lastSyncTime || displayData?.last_sync_time) && (
          <View className="items-center mb-6">
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              Last synced: {new Date(displayData.updated_at || displayData.metadata?.lastSyncTime || displayData.last_sync_time).toLocaleTimeString()}
            </Text>
          </View>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
}
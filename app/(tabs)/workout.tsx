import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import CalendarStrip from 'react-native-calendar-strip';
import YoutubePlayer from 'react-native-youtube-iframe';
import moment from 'moment';
import { API_URL } from '../../constants/Config';
import authService from '../../services/authService';

interface VideoItem {
  _id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelName?: string;
}

interface WorkoutRoutine {
  _id: string;
  title: string; // e.g., "Morning Cardio"
  focus: string; // e.g., "Cardio"
  difficulty: string;
  totalDuration: number;
  caloriesBurned: number;
  videos: VideoItem[];
  generatedAt: string;
}

export default function WorkoutScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [startingDate] = useState(moment().subtract(3, 'days'));
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [workout, setWorkout] = useState<WorkoutRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const hasLoadedData = useRef(false);

  const fetchTodaysWorkout = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Only set loading if we haven't loaded data yet
      if (!hasLoadedData.current) setLoading(true);
      
      const response = await fetch(`${API_URL}/api/workouts/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkout(data);
        hasLoadedData.current = true;
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTodaysWorkout();
    }, [fetchTodaysWorkout])
  );

  const handleRegenerate = async () => {
    const token = authService.getToken();
    if (!token) return;

    try {
      setRegenerating(true);
      const response = await fetch(`${API_URL}/api/workouts/regenerate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkout(data);
      } else {
        Alert.alert("Error", "Failed to regenerate workout plan.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDateSelected = (date: moment.Moment) => {
    setSelectedDate(date);
    // In a real app, you'd fetch history for this date
  };

  const toggleVideo = (videoId: string) => {
    setPlayingVideoId(playingVideoId === videoId ? null : videoId);
  };

  const renderVideoCard = (video: VideoItem) => (
    <View key={video._id || video.youtubeId} className="bg-white dark:bg-gray-900 rounded-2xl mb-4 overflow-hidden border border-gray-200 dark:border-gray-800">
      {playingVideoId === video.youtubeId ? (
        <View className="w-full aspect-video bg-black">
          <YoutubePlayer
            height={220}
            play={true}
            videoId={video.youtubeId}
            onChangeState={(state) => {
              if (state === 'ended') setPlayingVideoId(null);
            }}
          />
        </View>
      ) : (
        <TouchableOpacity onPress={() => toggleVideo(video.youtubeId)} className="relative">
          <Image 
            source={{ uri: video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }} 
            className="w-full h-48 bg-gray-200"
            resizeMode="cover"
          />
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <View className="w-12 h-12 bg-white/90 rounded-full items-center justify-center">
              <MaterialIcons name="play-arrow" size={32} color="#9333EA" />
            </View>
          </View>
          <View className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-bold">{video.duration || 'Video'}</Text>
          </View>
        </TouchableOpacity>
      )}

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">{video.title}</Text>
            <Text className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded self-start">
              {video.channelName || 'YouTube'}
            </Text>
          </View>
          <TouchableOpacity 
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
            onPress={() => console.log('Bookmark workout')}
          >
            <MaterialIcons name="bookmark-border" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper bg="bg-gray-50 dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 mt-4 mb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plan</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {workout ? workout.title : 'Stay active, stay healthy'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleRegenerate} 
            disabled={regenerating}
            className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full"
          >
            {regenerating ? (
              <ActivityIndicator size="small" color="#9333EA" />
            ) : (
              <MaterialIcons name="refresh" size={24} color="#9333EA" />
            )}
          </TouchableOpacity>
        </View>

        {/* Calendar Strip */}
        <View className="mb-6">
          <CalendarStrip
            scrollable
            startingDate={startingDate}
            style={{ height: 100, paddingTop: 10, paddingBottom: 10 }}
            calendarColor={'transparent'}
            calendarHeaderStyle={{ color: '#9333EA', fontSize: 16, marginBottom: 10 }}
            dateNumberStyle={{ color: '#6B7280', fontSize: 14 }}
            dateNameStyle={{ color: '#9CA3AF', fontSize: 10 }}
            iconContainer={{ flex: 0.1 }}
            highlightDateNumberStyle={{ color: 'white', backgroundColor: '#9333EA', borderRadius: 15, overflow: 'hidden', width: 30, height: 30, textAlign: 'center', lineHeight: 30 }}
            highlightDateNameStyle={{ color: '#9333EA' }}
            selectedDate={selectedDate}
            onDateSelected={handleDateSelected}
            daySelectionAnimation={{ type: 'background', duration: 200, highlightColor: '#F3E8FF' }}
          />
        </View>

        {/* Content */}
        <View className="px-4 pb-20">
          {loading && !workout ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#9333EA" />
              <Text className="mt-4 text-gray-500">Generating your personalized plan...</Text>
            </View>
          ) : !workout ? (
             <View className="items-center justify-center py-10">
              <MaterialIcons name="fitness-center" size={48} color="#E5E7EB" />
              <Text className="text-gray-400 mt-4 text-center">No workout plan found.</Text>
              <TouchableOpacity onPress={fetchTodaysWorkout} className="mt-4 bg-purple-600 px-6 py-2 rounded-full">
                <Text className="text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Summary Card */}
              <View className="bg-purple-600 rounded-2xl p-4 mb-6 flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-bold text-lg">{workout.focus}</Text>
                  <Text className="text-purple-200">{workout.difficulty} Level</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white font-bold text-xl">{workout.caloriesBurned} kcal</Text>
                  <Text className="text-purple-200">~{workout.totalDuration} min</Text>
                </View>
              </View>

              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recommended Routine
              </Text>
              
              {workout.videos.map(renderVideoCard)}

              {/* Complete Button */}
              <TouchableOpacity 
                className="mt-4 w-full bg-green-600 py-4 rounded-xl items-center flex-row justify-center"
                onPress={() => {
                  Alert.alert("Great Job!", "Workout marked as completed.");
                  // TODO: Call API to mark complete
                }}
              >
                <MaterialIcons name="check-circle-outline" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Complete Workout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

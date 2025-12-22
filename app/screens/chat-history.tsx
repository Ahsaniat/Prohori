import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { API_URL } from '../../constants/Config';
import authService from '../../services/authService';

interface ChatSession {
  _id: string;
  title: string;
  last_message_at: string;
  created_at: string;
}

export default function ChatHistoryScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/chat/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  }, [fetchSessions]);

  const handleSessionPress = (sessionId: string) => {
    router.push({
      pathname: '/screens/chat-detail' as any,
      params: { sessionId }
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const token = authService.getToken();
            if (!token) return;

            try {
              const res = await fetch(`${API_URL}/api/chat/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });

              if (res.ok) {
                setSessions(prev => prev.filter(s => s._id !== sessionId));
              }
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white flex-1">
          Chat History
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : sessions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="chat-bubble-outline" size={64} color="#9CA3AF" />
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 text-center">
            No Conversations Yet
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
            Start a new conversation with your health coach to see it here.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-purple-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Start Chatting</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottom + 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {sessions.map((session) => (
            <TouchableOpacity
              key={session._id}
              onPress={() => handleSessionPress(session._id)}
              onLongPress={() => handleDeleteSession(session._id)}
              className="flex-row items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800"
            >
              <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                <MaterialIcons name="chat" size={20} color="#9333EA" />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-base font-medium text-gray-900 dark:text-white"
                  numberOfLines={1}
                >
                  {session.title || 'New Chat'}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatDate(session.last_message_at)}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          ))}

          <Text className="text-center text-gray-400 dark:text-gray-600 text-xs mt-4 px-4">
            Long press to delete a conversation
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Animated,
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import { API_URL } from '../../constants/Config';
import authService from '../../services/authService';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Session {
  _id: string;
  title: string;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.created_at);
  
  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View 
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-purple-600 rounded-br-sm' 
            : 'bg-white dark:bg-gray-800 rounded-bl-sm'
        }`}
      >
        <Text className={isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'}>
          {message.content}
        </Text>
      </View>
      <Text className="text-xs text-gray-400 mt-1 px-1">
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

export default function ChatDetailScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const keyboardHeight = useKeyboardHeight();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      const token = authService.getToken();
      if (!token || !sessionId) {
        setInitialLoading(false);
        return;
      }

      try {
        // Get messages
        const messagesRes = await fetch(
          `${API_URL}/api/chat/sessions/${sessionId}/messages`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (messagesRes.ok) {
          const msgs = await messagesRes.json();
          setMessages(msgs);
        }

        // Get session info
        const sessionsRes = await fetch(`${API_URL}/api/chat/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          const currentSession = sessions.find((s: Session) => s._id === sessionId);
          if (currentSession) {
            setSession(currentSession);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !sessionId) return;

    const token = authService.getToken();
    if (!token) return;

    const tempUserMessage: Message = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempUserMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/chat/sessions/${sessionId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: text.trim() }),
        }
      );

      if (res.ok) {
        const { userMessage, aiMessage } = await res.json();
        
        setMessages((prev) => {
          const filtered = prev.filter(m => m._id !== tempUserMessage._id);
          return [...filtered, userMessage, aiMessage];
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        _id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';

  if (initialLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
          <MaterialIcons name="smart-toy" size={20} color="#9333EA" />
        </View>
        <View className="flex-1">
          <Text 
            className="text-base font-bold text-gray-900 dark:text-white"
            numberOfLines={1}
          >
            {session?.title || 'Health Coach'}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {isLoading ? 'Typing...' : 'Online'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="chat-bubble-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
              No messages in this conversation yet.
            </Text>
          </View>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
            {isLoading && (
              <View className="items-start mb-4">
                <View className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                  <ActivityIndicator size="small" color="#9333EA" />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input Area */}
      <Animated.View 
        className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
        style={{ marginBottom: keyboardHeight, paddingBottom: Math.max(bottom, 8) }}
      >
        <View className="flex-row items-end">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 mr-2 text-gray-900 dark:text-white max-h-24"
          />
          <TouchableOpacity
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-full ${
              inputText.trim() && !isLoading
                ? 'bg-purple-600'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <MaterialIcons 
              name="send" 
              size={20} 
              color={inputText.trim() && !isLoading ? 'white' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

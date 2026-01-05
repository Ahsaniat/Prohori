import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { API_URL } from '../../constants/Config';
import authService from '../../services/authService';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface SuggestedQuestion {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
}

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { icon: 'sync', text: 'How do I sync my health data?' },
  { icon: 'lock', text: 'How do I change my password?' },
  { icon: 'notifications', text: 'Why am I not receiving notifications?' },
  { icon: 'restaurant', text: 'How do I update my meal preferences?' },
  { icon: 'fitness-center', text: 'Workout videos are not playing' },
  { icon: 'help', text: 'How do I contact email support?' },
];

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

function SuggestedQuestionCard({ question, onPress }: { question: SuggestedQuestion; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-3 flex-row items-center border border-gray-100 dark:border-gray-700"
    >
      <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
        <MaterialIcons name={question.icon} size={20} color="#9333EA" />
      </View>
      <Text className="flex-1 text-gray-700 dark:text-gray-300">{question.text}</Text>
      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function LiveSupportScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';
  const bottomPadding = Math.max(bottom, 20);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    const initSupport = async () => {
      const token = authService.getToken();
      if (!token) {
        setInitialLoading(false);
        return;
      }

      try {
        const sessionsRes = await fetch(`${API_URL}/api/support/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          
          if (sessions.length > 0) {
            const latestSession = sessions[0];
            setSessionId(latestSession._id);
            
            const messagesRes = await fetch(
              `${API_URL}/api/support/sessions/${latestSession._id}/messages`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (messagesRes.ok) {
              const msgs = await messagesRes.json();
              setMessages(msgs);
            }
          } else {
            await createNewSession(token);
          }
        }
      } catch (error) {
        console.error('[LiveSupport] Error initializing:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    initSupport();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const createNewSession = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/support/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        const session = await res.json();
        setSessionId(session._id);
        setMessages([]);
        return session._id;
      }
    } catch (error) {
      console.error('[LiveSupport] Error creating session:', error);
    }
    return null;
  };

  const startNewChat = async () => {
    const token = authService.getToken();
    if (!token) return;
    
    setMessages([]);
    setSessionId(null);
    await createNewSession(token);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const token = authService.getToken();
    if (!token) return;

    let currentSessionId = sessionId;
    
    if (!currentSessionId) {
      currentSessionId = await createNewSession(token);
      if (!currentSessionId) return;
    }

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
        `${API_URL}/api/support/sessions/${currentSessionId}/messages`,
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
      console.error('[LiveSupport] Error sending message:', error);
      const errorMessage: Message = {
        _id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support@shasthohive.app.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: SuggestedQuestion) => {
    sendMessage(question.text);
  };

  const showWelcome = messages.length === 0 && !initialLoading;

  if (initialLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-black items-center justify-center" style={{ paddingTop: top }}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
            <MaterialIcons name="support-agent" size={24} color="#9333EA" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Live Support</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Typing...' : 'Online'}
            </Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={startNewChat} className="p-2">
              <MaterialIcons name="add-comment" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Messages or Welcome Screen */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {showWelcome ? (
            <View className="flex-1">
              {/* Welcome Header */}
              <View className="items-center mt-8 mb-8">
                <View className="h-20 w-20 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mb-4">
                  <MaterialIcons name="support-agent" size={40} color="#9333EA" />
                </View>
                <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2">
                  How can we help you?
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center px-10">
                  Ask questions about using the app, troubleshooting issues, or getting help with features.
                </Text>
              </View>

              {/* Suggested Questions */}
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Common questions:
              </Text>
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <SuggestedQuestionCard
                  key={index}
                  question={question}
                  onPress={() => handleSuggestedQuestion(question)}
                />
              ))}
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
        <View 
          className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
          style={{ paddingBottom: bottomPadding }}
        >
          <View className="flex-row items-end">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Describe your issue..."
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
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

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
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import { API_URL } from '../../constants/Config';
import authService from '../../services/authService';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface SuggestedPrompt {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { icon: 'restaurant', text: 'Suggest a healthy dinner for tonight' },
  { icon: 'fitness-center', text: 'Create a quick 15-minute workout' },
  { icon: 'bedtime', text: 'How can I improve my sleep quality?' },
  { icon: 'local-fire-department', text: 'How many calories should I eat daily?' },
  { icon: 'directions-walk', text: 'What\'s a good daily step goal?' },
  { icon: 'water-drop', text: 'How much water should I drink?' },
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

function SuggestedPromptCard({ prompt, onPress }: { prompt: SuggestedPrompt; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-3 flex-row items-center border border-gray-100 dark:border-gray-700"
    >
      <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
        <MaterialIcons name={prompt.icon} size={20} color="#9333EA" />
      </View>
      <Text className="flex-1 text-gray-700 dark:text-gray-300">{prompt.text}</Text>
      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const keyboardHeight = useKeyboardHeight();
  const scrollViewRef = useRef<ScrollView>(null);

  // Adjust for Tab Bar Height (60px)
  // When keyboard is 0, margin is 0.
  // When keyboard > 60, margin is keyboardHeight - 60.
  const animatedMarginBottom = keyboardHeight.interpolate({
    inputRange: [0, 60, 1000],
    outputRange: [0, 0, 940],
    extrapolate: 'clamp'
  });

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Create or get active session on mount
  useEffect(() => {
    const initChat = async () => {
      const token = authService.getToken();
      if (!token) {
        setInitialLoading(false);
        return;
      }

      try {
        // Get existing sessions
        const sessionsRes = await fetch(`${API_URL}/api/chat/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          
          if (sessions.length > 0) {
            // Use the most recent session
            const latestSession = sessions[0];
            setSessionId(latestSession._id);
            
            // Load messages for this session
            const messagesRes = await fetch(
              `${API_URL}/api/chat/sessions/${latestSession._id}/messages`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (messagesRes.ok) {
              const msgs = await messagesRes.json();
              setMessages(msgs);
            }
          } else {
            // Create a new session
            await createNewSession(token);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    initChat();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const createNewSession = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      
      if (res.ok) {
        const session = await res.json();
        setSessionId(session._id);
        setMessages([]);
        return session._id;
      }
    } catch (error) {
      console.error('Error creating session:', error);
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
    if (!token) {
      return;
    }

    let currentSessionId = sessionId;
    
    // Create session if needed
    if (!currentSessionId) {
      currentSessionId = await createNewSession(token);
      if (!currentSessionId) return;
    }

    // Optimistically add user message to UI
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
        `${API_URL}/api/chat/sessions/${currentSessionId}/messages`,
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
        const { userMessage, aiMessage, session } = await res.json();
        
        // Replace temp message with real ones
        setMessages((prev) => {
          const filtered = prev.filter(m => m._id !== tempUserMessage._id);
          return [...filtered, userMessage, aiMessage];
        });
        
        // Log if session title was updated (for debugging)
        if (session?.title && session.title !== 'New Chat') {
          console.log('Chat title updated:', session.title);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
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

  const handleSuggestedPrompt = (prompt: SuggestedPrompt) => {
    sendMessage(prompt.text);
  };

  const handleHistoryPress = () => {
    router.push('/screens/chat-history' as any);
  };

  const showWelcome = messages.length === 0 && !initialLoading;

  if (initialLoading) {
    return (
      <ScreenWrapper bg="bg-gray-50 dark:bg-black">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="bg-gray-50 dark:bg-black" style={{ paddingBottom: 0 }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          <View className="flex-row items-center">
            <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
              <MaterialIcons name="smart-toy" size={24} color="#9333EA" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Health Coach</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {isLoading ? 'Typing...' : 'Online'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleHistoryPress}
              className="p-2 mr-1"
            >
              <MaterialIcons name="history" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            {messages.length > 0 && (
              <TouchableOpacity 
                onPress={startNewChat}
                className="p-2"
              >
                <MaterialIcons name="add-comment" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

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
                  <Text className="text-4xl">💬</Text>
                </View>
                <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2">
                  How can I help you today?
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center px-10">
                  Ask me about your diet, workout plan, or general health questions.
                </Text>
              </View>

              {/* Suggested Prompts */}
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Try asking about:
              </Text>
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <SuggestedPromptCard
                  key={index}
                  prompt={prompt}
                  onPress={() => handleSuggestedPrompt(prompt)}
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

        {/* Input Area with Animated Keyboard Avoidance */}
        <Animated.View 
          className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
          style={{ marginBottom: animatedMarginBottom }}
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
    </ScreenWrapper>
  );
}
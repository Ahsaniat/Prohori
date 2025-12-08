import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { StatusBar } from 'expo-status-bar';
import notificationService from '../../services/notificationService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.110:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        notificationService.setToken(data.token);
        router.replace('/(tabs)/settings');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="bg-white dark:bg-black">
      <StatusBar style="auto" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        <View className="items-center mb-10">
          <Image 
            source={require('../../assets/images/Sahsthohive.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-4">ShasthoHive</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
            Your personal health and wellness companion
          </Text>
        </View>

        <View className="w-full">
          <Input 
            label="Email" 
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            label="Password" 
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Text className="text-purple-600 text-right mb-6 font-medium">
            Forgot Password?
          </Text>

          <Button 
            title="Login" 
            onPress={handleLogin} 
            loading={loading}
            className="mb-4 shadow-md"
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 dark:text-gray-400">Don&apos;t have an account? </Text>
            <Text className="text-purple-600 font-bold">Sign Up</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
import React, { useState } from 'react';
import { View, Text, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await authService.login(email, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Login failed:', error);
      // You might want to show an alert here
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="bg-white dark:bg-black">
      <StatusBar style="auto" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
          showsVerticalScrollIndicator={false}
          className="px-6"
          keyboardShouldPersistTaps="handled"
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
              <Link href="/screens/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-purple-600 font-bold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
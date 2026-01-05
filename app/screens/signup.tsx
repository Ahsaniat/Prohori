import React, { useState } from 'react';
import { View, Text, ScrollView, Image, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { StatusBar } from 'expo-status-bar';
import authService from '../../services/authService';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.register(name, email, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed');
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
          <View className="items-center mb-8">
            <Image 
              source={require('../../assets/images/Sahsthohive.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Create Account</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              Join ShasthoHive for a healthier you
            </Text>
          </View>

          <View className="w-full">
            <Input 
              label="Full Name" 
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input 
              label="Confirm Password" 
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <Button 
              title="Sign Up" 
              onPress={handleSignUp} 
              loading={loading}
              className="mb-4 mt-4 shadow-md"
            />

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 dark:text-gray-400">Already have an account? </Text>
              <Link href="/screens/login" asChild>
                <TouchableOpacity>
                  <Text className="text-purple-600 font-bold">Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

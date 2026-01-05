import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import ScreenWrapper from '../../components/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function OtpLoginScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmResult, setConfirmResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(true);

  useEffect(() => {
    sendCode();
  }, []);

  const sendCode = async () => {
    if (!phoneNumber) return;
    
    setSendingCode(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirmResult(confirmation);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to send verification code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || !confirmResult) return;
    
    setLoading(true);
    try {
      await confirmResult.confirm(verificationCode);
      router.replace('/(tabs)/home');
    } catch (error: any) {
       console.error(error);
       Alert.alert('Error', 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="bg-white dark:bg-black">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }} 
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
            <Image 
              source={require('../../assets/images/Sahsthohive.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Two-Factor Authentication</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              Please enter the verification code sent to {phoneNumber}
            </Text>
        </View>

        <View>
             {sendingCode ? (
                 <Text className="text-center text-gray-500 mb-4">Sending code...</Text>
             ) : (
                <>
                    <Input
                        label="Verification Code"
                        placeholder="123456"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                    />
                    
                    <Button 
                        title="Verify" 
                        onPress={handleVerify} 
                        loading={loading}
                        className="mt-2"
                    />

                    <TouchableOpacity 
                        onPress={sendCode} 
                        className="mt-6 items-center"
                        disabled={loading}
                    >
                        <Text className="text-purple-600 font-medium">Resend Code</Text>
                    </TouchableOpacity>
                </>
             )}
             
             <TouchableOpacity 
                onPress={() => {
                    auth().signOut();
                    router.replace('/screens/login');
                }} 
                className="mt-4 items-center"
            >
                <Text className="text-gray-500">Back to Login</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

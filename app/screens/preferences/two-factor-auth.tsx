import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function TwoFactorAuthScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmResult, setConfirmResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifiedNumber, setVerifiedNumber] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has a verified phone number linked
    const user = auth().currentUser;
    if (user?.phoneNumber) {
      setVerifiedNumber(user.phoneNumber);
    }
  }, []);

  const sendCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    try {
      // Ensure number format is correct (e.g. +1...)
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const confirmation = await auth().signInWithPhoneNumber(formattedNumber);
      setConfirmResult(confirmation);
      Alert.alert('Success', 'Verification code sent!');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    if (!verificationCode || !confirmResult) return;
    
    setLoading(true);
    try {
      // Create a credential from the verification code
      const credential = auth.PhoneAuthProvider.credential(confirmResult.verificationId, verificationCode);
      
      const currentUser = auth().currentUser;
      if (currentUser) {
        // Link the phone credential to the current user
        await currentUser.linkWithCredential(credential);
        setVerifiedNumber(currentUser.phoneNumber);
        Alert.alert('Success', 'Two-Factor Authentication Enabled!');
        setConfirmResult(null);
        setVerificationCode('');
        setPhoneNumber('');
        // Refresh user to ensure phoneNumber is updated locally if needed
        await currentUser.reload();
        setVerifiedNumber(auth().currentUser?.phoneNumber || null);
      } else {
        Alert.alert('Error', 'No user logged in');
      }
    } catch (error: any) {
       if (error.code === 'auth/credential-already-in-use') {
         Alert.alert('Error', 'This phone number is already linked to another account.');
       } else if (error.code === 'auth/invalid-verification-code') {
         Alert.alert('Error', 'Invalid verification code.');
       } else {
         console.error(error);
         Alert.alert('Error', error.message || 'Failed to enable 2FA');
       }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
      Alert.alert(
          'Disable 2FA',
          'Are you sure you want to remove this phone number and disable Two-Factor Authentication?',
          [
              { text: 'Cancel', style: 'cancel' },
              {
                  text: 'Disable',
                  style: 'destructive',
                  onPress: async () => {
                      setLoading(true);
                      try {
                          const user = auth().currentUser;
                          if (user && user.phoneNumber) {
                              // To unlink, we need the providerId. For phone it is 'phone'.
                              await user.unlink('phone');
                              setVerifiedNumber(null);
                              Alert.alert('Success', 'Two-Factor Authentication Disabled');
                          }
                      } catch (error: any) {
                          Alert.alert('Error', error.message || 'Failed to disable 2FA');
                      } finally {
                          setLoading(false);
                      }
                  }
              }
          ]
      );
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">2 Factor Authentication</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4">
          <Text className="text-gray-600 dark:text-gray-400 mb-6">
            Add an extra layer of security to your account by enabling Two-Factor Authentication (2FA). 
            You will receive a verification code via SMS when logging in.
          </Text>

          {verifiedNumber ? (
            <View className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800">
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="verified" size={24} color="#10B981" />
                <Text className="text-lg font-bold text-green-700 dark:text-green-400 ml-2">2FA Enabled</Text>
              </View>
              <Text className="text-gray-700 dark:text-gray-300 mb-4">
                Your verified phone number:
                {'\n'}
                <Text className="font-bold text-lg">{verifiedNumber}</Text>
              </Text>
              
              <Button 
                 title="Disable 2FA" 
                 onPress={handleUnlink}
                 variant="outline" 
                 className="mt-2 bg-white dark:bg-black border-red-500"
                 textClassName="text-red-500"
              />
            </View>
          ) : (
            <View>
              {!confirmResult ? (
                <>
                  <Input
                    label="Phone Number"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                  <Button 
                    title="Send Verification Code"
                    onPress={sendCode}
                    loading={loading}
                    className="mt-4"
                  />
                </>
              ) : (
                <>
                  <View className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl mb-4">
                      <Text className="text-purple-800 dark:text-purple-300">
                          Code sent to {phoneNumber}
                      </Text>
                  </View>
                  <Input
                    label="Verification Code"
                    placeholder="123456"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                  />
                  <Button 
                    title="Verify & Enable"
                    onPress={confirmCode}
                    loading={loading}
                    className="mt-4"
                  />
                  <TouchableOpacity onPress={() => setConfirmResult(null)} className="mt-4 items-center">
                    <Text className="text-purple-600 dark:text-purple-400 font-medium">Change Phone Number</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
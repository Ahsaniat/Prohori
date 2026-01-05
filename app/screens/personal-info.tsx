import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import { API_URL } from '../../constants/Config';

export default function PersonalInfoScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper bg="bg-white dark:bg-black" includeTop={false}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="bg-white dark:bg-black" includeTop={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          className="px-5" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-6 mt-4">
               <View className="h-20 w-20 bg-purple-600 rounded-full items-center justify-center mb-2">
                  <Text className="text-white text-2xl font-bold">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
              </View>
          </View>

          <View>
              <Input 
                label="Full Name" 
                value={formData.name} 
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
              <Input 
                label="Email" 
                value={formData.email} 
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address" 
                editable={false} // Email usually shouldn't be changed easily
              />
              <Input 
                label="Phone Number" 
                value={formData.phone} 
                onChangeText={(text) => setFormData({...formData, phone: text})}
                keyboardType="phone-pad" 
              />
              <Input 
                label="Date of Birth" 
                value={formData.dateOfBirth} 
                onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
                placeholder="MM/DD/YYYY"
              />
              
              <View className="mt-4">
                  <Button 
                    title="Save Changes" 
                    onPress={handleUpdate} 
                    loading={saving}
                  />
              </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function PersonalInfoScreen() {
  return (
    <ScreenWrapper bg="bg-white dark:bg-black">
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6 mt-4">
             <View className="h-20 w-20 bg-purple-600 rounded-full items-center justify-center mb-2">
                <Text className="text-white text-2xl font-bold">AA</Text>
            </View>
            <Text className="text-purple-600 font-medium">Change Profile Photo</Text>
        </View>

        <View>
            <Input label="Full Name" value="Anik Ahsan" />
            <Input label="Email" value="anik.ahsan@gmail.com" keyboardType="email-address" />
            <Input label="Phone Number" value="+1 234 567 890" keyboardType="phone-pad" />
            <Input label="Date of Birth" value="01/01/1990" />
            
            <View className="mt-4">
                <Button title="Save Changes" onPress={() => {}} />
            </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
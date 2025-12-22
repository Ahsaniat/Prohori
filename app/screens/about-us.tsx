import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

const FEATURES = [
  { name: 'Health & Nutrition', icon: 'restaurant' as const },
  { name: 'Fitness & Exercise', icon: 'fitness-center' as const },
  { name: 'Sleep & Recovery', icon: 'bedtime' as const },
  { name: 'Mental Wellness', icon: 'psychology' as const },
];

const SOCIAL_LINKS = [
  { name: 'Twitter', icon: 'alternate-email', url: 'https://twitter.com/shasthohive' },
  { name: 'Instagram', icon: 'camera-alt', url: 'https://instagram.com/shasthohive' },
  { name: 'LinkedIn', icon: 'work', url: 'https://linkedin.com/company/shasthohive' },
];

export default function AboutUsScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">About Us</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Title */}
        <View className="items-center mt-6 mb-6">
          <Image 
            source={require('../../assets/images/Sahsthohive.png')} 
            className="h-24 w-24 rounded-3xl mb-4"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">ShastoHive</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">Your Personal Health Companion</Text>
          <View className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full mt-2">
            <Text className="text-purple-600 dark:text-purple-400 text-sm font-medium">Version 1.0.0</Text>
          </View>
        </View>

        {/* Mission Statement */}
        <View className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Our Mission</Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            ShastoHive is dedicated to empowering individuals to take control of their health journey. 
            We combine cutting-edge technology with personalized insights to help you achieve your 
            wellness goals, whether it's eating better, moving more, or living healthier.
          </Text>
        </View>

        {/* Features */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          What We Offer
        </Text>
        {FEATURES.map((feature) => (
          <View
            key={feature.name}
            className="flex-row items-center py-4"
          >
            <MaterialIcons name={feature.icon} size={24} color={iconColor} style={{ marginRight: 12 }} />
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              {feature.name}
            </Text>
          </View>
        ))}

        {/* Connect */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-3">
          Connect With Us
        </Text>
        <View className="flex-row justify-center mb-6">
          {SOCIAL_LINKS.map((social) => (
            <TouchableOpacity
              key={social.name}
              onPress={() => Linking.openURL(social.url)}
              className="p-4 mx-2"
            >
              <MaterialIcons name={social.icon as any} size={28} color="#9333EA" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal Links */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Legal
        </Text>
        <TouchableOpacity className="flex-row items-center justify-between py-4">
          <Text className="text-base text-gray-900 dark:text-white">Terms of Service</Text>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center justify-between py-4">
          <Text className="text-base text-gray-900 dark:text-white">Privacy Policy</Text>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center justify-between py-4">
          <Text className="text-base text-gray-900 dark:text-white">Open Source Licenses</Text>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Footer */}
        <Text className="text-center text-gray-400 dark:text-gray-600 text-sm mt-6 mb-2">
          Made with ❤️ for your health
        </Text>
        <Text className="text-center text-gray-400 dark:text-gray-600 text-xs">
          © 2025 ShastoHive. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

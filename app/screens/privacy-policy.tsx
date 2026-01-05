import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Last updated: January 1, 2026
        </Text>

        <Text className="text-gray-600 dark:text-gray-400 leading-6 mb-6">
          Your privacy is important to us. This Privacy Policy explains how ShastoHive collects, 
          uses, and protects your personal information.
        </Text>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            1. Information We Collect
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6 mb-2">
            We collect information you provide directly to us, including:
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6 ml-4">
            - Account information (name, email, password){'\n'}
            - Health data (weight, height, activity levels, sleep patterns){'\n'}
            - Dietary preferences and nutrition logs{'\n'}
            - Fitness goals and workout history{'\n'}
            - Device information and usage data
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            2. How We Use Your Information
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            We use your information to:{'\n\n'}
            - Provide and improve our services{'\n'}
            - Personalize your health insights and recommendations{'\n'}
            - Sync data with Health Connect (with your permission){'\n'}
            - Send notifications about your health goals{'\n'}
            - Analyze usage patterns to enhance user experience{'\n'}
            - Communicate with you about updates and support
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            3. Health Connect Integration
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            When you grant permission, ShastoHive can read and write health data to Android 
            Health Connect. This data remains on your device and is only synced with our servers 
            when you choose to do so. You can revoke these permissions at any time through your 
            device settings.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            4. Data Security
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            We implement industry-standard security measures to protect your data, including:{'\n\n'}
            - Encryption of data in transit and at rest{'\n'}
            - Secure authentication mechanisms{'\n'}
            - Regular security audits and updates{'\n'}
            - Limited access to personal data by employees
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            5. Data Sharing
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            We do not sell your personal information. We may share your data only:{'\n\n'}
            - With your explicit consent{'\n'}
            - To comply with legal obligations{'\n'}
            - With service providers who assist in operating our services{'\n'}
            - In aggregated, anonymized form for research purposes
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            6. Your Rights
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            You have the right to:{'\n\n'}
            - Access your personal data{'\n'}
            - Correct inaccurate information{'\n'}
            - Delete your account and associated data{'\n'}
            - Export your health data{'\n'}
            - Opt out of non-essential communications
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            7. Data Retention
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            We retain your data for as long as your account is active or as needed to provide 
            you services. You can request deletion of your account and data at any time by 
            contacting our support team.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            8. Children's Privacy
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            ShastoHive is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            9. Changes to This Policy
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            We may update this Privacy Policy periodically. We will notify you of significant 
            changes through the app or via email.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            10. Contact Us
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            For questions about this Privacy Policy or your data, contact us at 
            privacy@shasthohive.com.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

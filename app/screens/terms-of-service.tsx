import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Last updated: January 1, 2026
        </Text>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            1. Acceptance of Terms
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            By accessing or using ShastoHive, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            2. Description of Service
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            ShastoHive provides health and wellness tracking tools, including but not limited to 
            nutrition tracking, fitness monitoring, sleep analysis, and personalized health insights. 
            Our services are for informational purposes only and should not replace professional 
            medical advice.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            3. User Accounts
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities that occur under your account. You must provide accurate and 
            complete information when creating an account.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            4. Health Information Disclaimer
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            ShastoHive is not a medical device and is not intended to diagnose, treat, cure, or 
            prevent any disease. The health information provided through our app is for general 
            educational purposes only. Always consult with a qualified healthcare provider before 
            making any health-related decisions.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            5. User Conduct
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            You agree not to misuse our services, attempt to gain unauthorized access to our 
            systems, or use the app for any illegal purposes. We reserve the right to terminate 
            accounts that violate these terms.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            6. Intellectual Property
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            All content, features, and functionality of ShastoHive are owned by us and are 
            protected by international copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            7. Limitation of Liability
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            To the maximum extent permitted by law, ShastoHive shall not be liable for any 
            indirect, incidental, special, consequential, or punitive damages resulting from 
            your use of or inability to use our services.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            8. Changes to Terms
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            We may update these Terms of Service from time to time. We will notify you of any 
            significant changes by posting the new terms in the app. Your continued use of our 
            services after such changes constitutes acceptance of the updated terms.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            9. Contact Us
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 leading-6">
            If you have any questions about these Terms of Service, please contact us at 
            support@shasthohive.com.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

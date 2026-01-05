import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

const FAQ_ITEMS = [
  {
    question: 'How do I sync my health data?',
    answer: 'Go to the Home tab and tap "Connect Health Data" to sync with Health Connect. Make sure you have granted the necessary permissions.',
  },
  {
    question: 'How do I update my meal preferences?',
    answer: 'Navigate to the Meal tab and tap the settings icon in the top right corner. You can update your dietary preferences, allergies, and cooking preferences there.',
  },
  {
    question: 'Can I use the app offline?',
    answer: 'Yes, you can view your saved meal plans and health data offline. However, syncing and generating new meal plans requires an internet connection.',
  },
  {
    question: 'How do I change my notification settings?',
    answer: 'Go to Settings > Notifications to customize which notifications you receive and when.',
  },
  {
    question: 'Is my health data secure?',
    answer: 'Yes, all your health data is encrypted and stored securely. We never sell or share your personal information with third parties.',
  },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';

  const SUPPORT_OPTIONS = [
    {
      icon: 'chat' as const,
      title: 'Live Support',
      description: 'Chat with our support assistant',
      action: () => router.push('/screens/live-support'),
    },
    {
      icon: 'email' as const,
      title: 'Email Support',
      description: 'Get help via email',
      action: () => Linking.openURL('mailto:support@shasthohive.app'),
    },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Help Center</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="bg-purple-600 rounded-2xl p-6 mt-4 items-center">
          <MaterialIcons name="support-agent" size={40} color="white" />
          <Text className="text-xl font-bold text-white text-center mt-3">How can we help?</Text>
          <Text className="text-purple-200 text-center mt-1">
            Find answers to common questions or contact our support team
          </Text>
        </View>

        {/* Quick Actions */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Contact Support
        </Text>
        {SUPPORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.title}
            onPress={option.action}
            className="flex-row items-center py-4"
          >
            <MaterialIcons name={option.icon} size={24} color={iconColor} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                {option.title}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {/* FAQ Section */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Frequently Asked Questions
        </Text>
        {FAQ_ITEMS.map((faq, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            className="py-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-medium text-gray-900 dark:text-white flex-1 mr-2">
                {faq.question}
              </Text>
              <MaterialIcons 
                name={expandedFaq === index ? 'expand-less' : 'expand-more'} 
                size={24} 
                color="#9CA3AF" 
              />
            </View>
            {expandedFaq === index && (
              <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {faq.answer}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Still need help */}
        <View className="bg-gray-100 dark:bg-neutral-800 rounded-2xl p-4 mt-6 flex-row items-center">
          <MaterialIcons name="help" size={24} color="#9333EA" />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-medium text-gray-900 dark:text-white">
              Still need help?
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Our support team is available 24/7
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

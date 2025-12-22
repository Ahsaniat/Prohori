import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    'en': '🇺🇸',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'it': '🇮🇹',
    'pt': '🇵🇹',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'ar': '🇸🇦',
    'hi': '🇮🇳',
    'bn': '🇧🇩',
  };
  return flags[countryCode] || '🌐';
}

export default function LanguageScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Language</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Language */}
        <View className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 mt-4 mb-6">
          <View className="flex-row items-center">
            <MaterialIcons name="translate" size={24} color="#9333EA" style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="text-sm text-purple-600 dark:text-purple-400">Current Language</Text>
              <Text className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Language List */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Available Languages
        </Text>
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleSelectLanguage(language.code)}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center flex-1">
              <Text className="text-lg mr-3">{getFlagEmoji(language.code)}</Text>
              <View>
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {language.name}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {language.native}
                </Text>
              </View>
            </View>
            {selectedLanguage === language.code && (
              <MaterialIcons name="check" size={24} color="#9333EA" />
            )}
          </TouchableOpacity>
        ))}

        {/* Note */}
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 px-4">
          Changing the language will restart the app to apply the new settings.
        </Text>
      </ScrollView>
    </View>
  );
}

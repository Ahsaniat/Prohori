import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

interface License {
  name: string;
  version: string;
  license: string;
  url?: string;
}

const LICENSES: License[] = [
  { name: 'React Native', version: '0.81.x', license: 'MIT', url: 'https://github.com/facebook/react-native' },
  { name: 'Expo', version: '53.x', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'React Navigation', version: '7.x', license: 'MIT', url: 'https://github.com/react-navigation/react-navigation' },
  { name: 'Zustand', version: '5.x', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
  { name: 'NativeWind', version: '4.x', license: 'MIT', url: 'https://github.com/marklawlor/nativewind' },
  { name: 'React Native Health Connect', version: '3.x', license: 'MIT', url: 'https://github.com/matinzd/react-native-health-connect' },
  { name: 'React Native YouTube IFrame', version: '2.x', license: 'MIT', url: 'https://github.com/nicholasmueller/react-native-youtube-iframe' },
  { name: 'React Native Calendar Strip', version: '2.x', license: 'MIT', url: 'https://github.com/BugiDev/react-native-calendar-strip' },
  { name: 'Moment.js', version: '2.x', license: 'MIT', url: 'https://github.com/moment/moment' },
  { name: 'Axios', version: '1.x', license: 'MIT', url: 'https://github.com/axios/axios' },
  { name: 'Knock', version: '1.x', license: 'MIT', url: 'https://github.com/knocklabs/knock-node' },
  { name: 'Express', version: '4.x', license: 'MIT', url: 'https://github.com/expressjs/express' },
  { name: 'Mongoose', version: '8.x', license: 'MIT', url: 'https://github.com/Automattic/mongoose' },
  { name: 'Google GenAI SDK', version: '1.x', license: 'Apache-2.0', url: 'https://github.com/google/generative-ai-js' },
  { name: 'React Native Gesture Handler', version: '2.x', license: 'MIT', url: 'https://github.com/software-mansion/react-native-gesture-handler' },
  { name: 'React Native Reanimated', version: '3.x', license: 'MIT', url: 'https://github.com/software-mansion/react-native-reanimated' },
  { name: 'React Native Safe Area Context', version: '5.x', license: 'MIT', url: 'https://github.com/th3rdwave/react-native-safe-area-context' },
  { name: 'Expo Vector Icons', version: '14.x', license: 'MIT', url: 'https://github.com/expo/vector-icons' },
];

export default function OpenSourceLicensesScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const handleOpenUrl = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Open Source Licenses</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-600 dark:text-gray-400 leading-6 mb-6">
          ShastoHive is built with the help of many open source libraries. We are grateful to the 
          developers and communities behind these projects.
        </Text>

        <View className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-4 mb-6">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            The following open source software is used in this application. Tap on any library 
            to view its source code repository.
          </Text>
        </View>

        {LICENSES.map((lib, index) => (
          <TouchableOpacity
            key={lib.name}
            onPress={() => handleOpenUrl(lib.url)}
            className={`flex-row items-center justify-between py-4 ${
              index < LICENSES.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
            }`}
          >
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                {lib.name}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                v{lib.version}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded mr-2">
                <Text className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {lib.license}
                </Text>
              </View>
              {lib.url && (
                <MaterialIcons name="open-in-new" size={18} color="#9CA3AF" />
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View className="mt-6 mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            MIT License
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
            Permission is hereby granted, free of charge, to any person obtaining a copy of this 
            software and associated documentation files, to deal in the Software without restriction, 
            including without limitation the rights to use, copy, modify, merge, publish, distribute, 
            sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
            is furnished to do so, subject to the following conditions:{'\n\n'}
            The above copyright notice and this permission notice shall be included in all copies or 
            substantial portions of the Software.{'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Apache License 2.0
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
            Licensed under the Apache License, Version 2.0. You may obtain a copy of the License at 
            http://www.apache.org/licenses/LICENSE-2.0{'\n\n'}
            Unless required by applicable law or agreed to in writing, software distributed under 
            the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY 
            KIND, either express or implied.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

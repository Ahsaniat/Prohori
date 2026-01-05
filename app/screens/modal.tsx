import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function ModalScreen() {
  const isPresented = router.canGoBack();
  return (
    <ScreenWrapper bg="bg-white dark:bg-black" includeTop={false}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Modal</Text>
        <View className="h-[1px] w-[80%] bg-gray-200 dark:bg-gray-800 my-8" />
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
          This is a modal screen.
        </Text>
        
        {!isPresented && (
          <Link href="../" asChild>
            <Text className="text-purple-600">Dismiss</Text>
          </Link>
        )}

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </ScrollView>
    </ScreenWrapper>
  );
}
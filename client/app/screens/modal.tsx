import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View } from 'react-native';
import { Link, router } from 'expo-router';

export default function ModalScreen() {
  const isPresented = router.canGoBack();
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
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
    </View>
  );
}
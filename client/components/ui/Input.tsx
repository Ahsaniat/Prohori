import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 ml-1">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-4 text-gray-800 dark:text-white focus:border-purple-500 focus:border-2 ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
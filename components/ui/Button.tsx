import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  textClassName?: string;
}

export default function Button({ 
  title, 
  onPress, 
  loading = false, 
  variant = 'primary',
  className = '',
  textClassName = ''
}: ButtonProps) {
  
  const getBgColor = () => {
    switch(variant) {
      case 'primary': return 'bg-purple-600';
      case 'secondary': return 'bg-gray-200 dark:bg-gray-800';
      case 'outline': return 'bg-transparent border border-purple-600';
      default: return 'bg-purple-600';
    }
  };

  const getTextColor = () => {
    switch(variant) {
      case 'primary': return 'text-white';
      case 'secondary': return 'text-gray-800 dark:text-gray-200';
      case 'outline': return 'text-purple-600';
      default: return 'text-white';
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={loading}
      className={`py-4 px-6 rounded-xl items-center justify-center shadow-sm active:opacity-80 ${getBgColor()} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#374151' : 'white'} />
      ) : (
        <Text className={`font-bold text-lg ${getTextColor()} ${textClassName}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
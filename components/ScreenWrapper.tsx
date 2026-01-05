import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
  style?: ViewStyle;
  includeTop?: boolean;
  includeBottom?: boolean;
}

export default function ScreenWrapper({ children, bg = 'bg-white', style, includeTop = true, includeBottom = false }: ScreenWrapperProps) {
  const { top, bottom } = useSafeAreaInsets();
  const paddingTop = includeTop && top > 0 ? top : 0;
  const paddingBottom = includeBottom && bottom > 0 ? bottom : 0;

  return (
    <View 
      style={[{ flex: 1, paddingTop, paddingBottom }, style]}
      className={`flex-1 ${bg}`}
    >
      {children}
    </View>
  );
}
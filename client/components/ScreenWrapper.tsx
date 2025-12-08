import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
  style?: ViewStyle;
}

export default function ScreenWrapper({ children, bg = 'bg-white', style }: ScreenWrapperProps) {
  const { top, bottom } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 30;
  const paddingBottom = bottom > 0 ? bottom + 5 : 30;

  return (
    <View 
      style={[{ flex: 1, paddingTop, paddingBottom }, style]}
      className={`flex-1 ${bg}`}
    >
      {children}
    </View>
  );
}
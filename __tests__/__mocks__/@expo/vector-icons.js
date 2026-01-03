import React from 'react';
import { View } from 'react-native';

export const MaterialIcons = ({ name, size, color, style }) => {
  return React.createElement(View, { 
    testID: `icon-${name}`,
    style: style 
  });
};

export const Ionicons = MaterialIcons;
export const FontAwesome = MaterialIcons;
export const Feather = MaterialIcons;
export const AntDesign = MaterialIcons;

import React, { useEffect, useRef } from 'react';
import { Pressable, View, Animated, StyleSheet } from 'react-native';

interface CustomToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function CustomToggle({ value, onValueChange, disabled }: CustomToggleProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const toggle = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  // Interpolate for position
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // Adjust based on width
  });

  return (
    <Pressable onPress={toggle} style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.track}>
        <Animated.View 
            style={[
                styles.thumb, 
                { 
                    transform: [{ translateX }] 
                }
            ]} 
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'black', // The "circular path border"
    backgroundColor: 'white', // "white inside when off"
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'black', // "ball for on inside ... is black"
    position: 'absolute',
    left: 0,
  },
});

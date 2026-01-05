// Reusable UI components for preferences wizard
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SelectOptionProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
}

export function SelectOption({ label, selected, onSelect }: SelectOptionProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`flex-row items-center p-4 mb-2 rounded-xl border ${
        selected 
          ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
        selected ? 'border-purple-500 bg-purple-500' : 'border-gray-300 dark:border-gray-600'
      }`}>
        {selected && <MaterialIcons name="check" size={16} color="white" />}
      </View>
      <Text className={`flex-1 text-base ${
        selected ? 'text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-700 dark:text-gray-300'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface MultiSelectChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function MultiSelectChip({ label, selected, onToggle }: MultiSelectChipProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
        selected 
          ? 'bg-purple-500' 
          : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <Text className={selected ? 'text-white font-medium' : 'text-gray-700 dark:text-gray-300'}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
}

export function NumberInput({ label, value, onChangeText, placeholder, unit }: NumberInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</Text>
      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
        />
        {unit && (
          <Text className="ml-2 text-gray-500 dark:text-gray-400">{unit}</Text>
        )}
      </View>
    </View>
  );
}

interface TextInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function TextInputField({ label, value, onChangeText, placeholder, multiline }: TextInputFieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white ${
          multiline ? 'min-h-[80px]' : ''
        }`}
      />
    </View>
  );
}

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack: () => void;
  showBack?: boolean;
}

export function WizardHeader({ currentStep, totalSteps, title, subtitle, onBack, showBack = true }: WizardHeaderProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-4">
        {showBack && (
          <TouchableOpacity onPress={onBack} className="mr-3 p-1">
            <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <Text className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
      </View>
      
      {/* Progress bar */}
      <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
        <View 
          className="h-2 bg-purple-500 rounded-full" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{title}</Text>
      {subtitle && (
        <Text className="text-gray-500 dark:text-gray-400">{subtitle}</Text>
      )}
    </View>
  );
}

interface WizardFooterProps {
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  showSkip?: boolean;
  disabled?: boolean;
}

export function WizardFooter({ onNext, onSkip, nextLabel = 'Continue', showSkip = false, disabled = false }: WizardFooterProps) {
  return (
    <View className="pt-4 pb-6">
      <TouchableOpacity
        onPress={onNext}
        disabled={disabled}
        className={`py-4 rounded-xl items-center ${
          disabled ? 'bg-gray-300 dark:bg-gray-700' : 'bg-purple-600'
        }`}
      >
        <Text className="text-white font-semibold text-base">{nextLabel}</Text>
      </TouchableOpacity>
      
      {showSkip && onSkip && (
        <TouchableOpacity onPress={onSkip} className="py-3 items-center mt-2">
          <Text className="text-gray-500 dark:text-gray-400">Skip for now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ label, description, value, onValueChange }: ToggleRowProps) {
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
    >
      <View className="flex-1 mr-4">
        <Text className="text-base text-gray-900 dark:text-white">{label}</Text>
        {description && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</Text>
        )}
      </View>
      <View className={`w-12 h-7 rounded-full p-1 ${value ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <View className={`w-5 h-5 rounded-full bg-white ${value ? 'ml-auto' : ''}`} />
      </View>
    </TouchableOpacity>
  );
}

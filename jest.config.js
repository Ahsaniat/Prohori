module.exports = {
  testEnvironment: 'jsdom',
  globals: {
    __DEV__: true,
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'services/**/*.ts',
    'app/**/*.tsx',
    '!**/node_modules/**',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@expo/vector-icons$': '<rootDir>/__tests__/__mocks__/@expo/vector-icons.js',
    '^expo-font$': '<rootDir>/__tests__/__mocks__/expo-font.js',
  },
};
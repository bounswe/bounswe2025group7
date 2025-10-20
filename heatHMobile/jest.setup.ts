import '@testing-library/jest-native/extend-expect';

// Mock react-native-reanimated per docs
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Gesture handler testing setup
import 'react-native-gesture-handler/jestSetup';

// Mock expo-router helpers
jest.mock('expo-router', () => require('expo-router/jest'));

// Mock AsyncStorage for unit tests
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));



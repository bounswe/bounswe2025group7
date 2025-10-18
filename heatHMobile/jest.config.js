module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-clone-referenced-element|@react-navigation/.+|expo($|/.+)|expo-router|expo-modules-core|@expo/.+|react-native-reanimated|react-native-gesture-handler)/)'
  ],
  testMatch: ['**/__test__/**/*.(test|spec).?(ts|tsx|js|jsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/dist/', '/web/', '/app/'],
};



module.exports = {
  preset: '@react-native/jest-preset',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/report/',
    '/ui-prototype/',
    '__tests__/setup.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage)/)',
  ],
  setupFilesAfterEnv: ['./__tests__/setup.ts'],
};

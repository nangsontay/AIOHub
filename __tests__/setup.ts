jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest').default,
);

jest.mock('react-native-safe-area-context', () => {
  const {View} = require('react-native');
  return {
    SafeAreaProvider: ({children}: {children: unknown}) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({top: 0, left: 0, right: 0, bottom: 0}),
  };
});

jest.mock('../src/browser/browser-view', () => {
  const React = require('react');
  const {View} = require('react-native');
  const BrowserView = (props: {sourceUrl: string}) =>
    React.createElement(View, {
      accessibilityLabel: 'Browser: ' + props.sourceUrl,
    });
  return {__esModule: true, default: BrowserView};
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const {View} = require('react-native');
  const shape = (props: Record<string, unknown>) =>
    React.createElement(View, props);
  return new Proxy(
    {},
    {
      get: (_target: Record<string, unknown>, prop: string) => {
        if (prop === '__esModule') return true;
        return shape;
      },
    },
  );
});

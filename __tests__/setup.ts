import {View} from 'react-native';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest').default,
);

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
  SafeAreaView: View,
  useSafeAreaInsets: () => ({top: 0, left: 0, right: 0, bottom: 0}),
}));

jest.mock('../src/browser/browser-view', () => {
  const BrowserView = ({sourceUrl}: {sourceUrl: string}) =>
    View({accessibilityLabel: 'Browser: ' + sourceUrl});
  return {__esModule: true, default: BrowserView};
});

jest.mock('react-native-svg', () => {
  const shape = (props: {children?: unknown}) => View(props);
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

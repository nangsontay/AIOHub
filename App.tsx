import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/state/store';
import { BrandHeader } from './src/components/ui';
import { colors } from './src/theme/tokens';
import WelcomeScreen from './src/screens/welcome';
import AuthScreen from './src/screens/auth';
import HomeScreen from './src/screens/home';
import CategoryScreen from './src/screens/category';
import RestoreScreen from './src/screens/restore';
import Panels from './src/screens/panels';
import ProviderScreen from './src/screens/provider';

function Shell() {
  const { ready, route, data, offline, who, openPanel } = useApp();
  let screen: React.ReactNode = null;
  if (ready) {
    if (route.page === 'welcome') {
      screen = <WelcomeScreen />;
    } else if (route.page === 'signin' || route.page === 'register') {
      screen = <AuthScreen key={route.page + data.device} />;
    } else if (route.page === 'home') {
      screen = <HomeScreen />;
    } else if (route.page === 'category') {
      screen = <CategoryScreen />;
    } else if (route.page === 'restore') {
      screen = <RestoreScreen />;
    } else {
      screen = <ProviderScreen />;
    }
  }
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {!!screen && (
        <>
          <BrandHeader
            guest={data.guest}
            initial={
              data.user || data.guest
                ? (who()[0] ?? '?').toUpperCase()
                : undefined
            }
            onAccount={() => openPanel('account')}
            onDemo={() => openPanel('demo')}
            offline={offline}
          />
          <View style={styles.body}>{screen}</View>
          <Panels />
        </>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  body: { flex: 1 },
});

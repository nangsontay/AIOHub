import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BackLink, Button, Screen, StateCard } from '../components/ui';
import { colors } from '../theme/tokens';
import { useApp } from '../state/store';
import MediaPlayer from './media-player';
import WebService from './web-service';
import ProviderSession from './provider-session';

function ProviderFrame({
  service,
  onServices,
  children,
}: {
  service: string;
  onServices: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.servicebar}>
        <BackLink label="Services" onPress={onServices} />
        <Text style={styles.serviceName}>{service}</Text>
      </View>
      {children}
    </View>
  );
}

export default function ProviderScreen() {
  const app = useApp();
  if (app.route.page !== 'provider') return null;
  const { cat, service, phase } = app.route;
  const goServices = () => app.goCategory(cat);

  if (phase === 'loading')
    return (
      <ProviderFrame service={service} onServices={goServices}>
        <Screen>
          <StateCard
            symbol="loading"
            title={'Opening ' + service + '…'}
            text="Loading the service page."
          >
            {app.held === 'loading' && (
              <View style={styles.rowline}>
                <Button
                  label="Finish loading"
                  variant="tonal"
                  onPress={app.finishLoad}
                />
              </View>
            )}
          </StateCard>
        </Screen>
      </ProviderFrame>
    );

  if (phase === 'error' || app.offline)
    return (
      <ProviderFrame service={service} onServices={goServices}>
        <Screen>
          <StateCard
            symbol={app.offline ? 'offline' : 'warn'}
            title={'Couldn’t load ' + service}
            text={
              app.offline
                ? 'You are offline. Return to the service list or reconnect in Demo controls.'
                : 'The service page could not be opened.'
            }
          >
            <View style={styles.rowline}>
              <Button label="Retry" variant="primary" onPress={app.retry} />
              <Button label="Back" onPress={goServices} />
            </View>
          </StateCard>
        </Screen>
      </ProviderFrame>
    );

  if (cat === 'News' || cat === 'Game')
    return (
      <ProviderFrame service={service} onServices={goServices}>
        <WebService service={service} />
        {cat !== 'Game' && (
          <View style={styles.webSession}>
            <ProviderSession cat={cat} />
          </View>
        )}
      </ProviderFrame>
    );

  return (
    <ProviderFrame service={service} onServices={goServices}>
      <Screen>
        <MediaPlayer key={cat + ':' + service} cat={cat} service={service} />
        <ProviderSession cat={cat} />
      </Screen>
    </ProviderFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webSession: { paddingHorizontal: 24, paddingBottom: 12 },
  servicebar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#faf9fd',
  },
  serviceName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  rowline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

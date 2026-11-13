import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui';
import { colors, spacing } from '../theme/tokens';
import { type Cat, useApp } from '../state/store';

export default function ProviderSession({ cat }: { cat: Cat }) {
  const app = useApp();
  const service = app.route.page === 'provider' ? app.route.service : undefined;
  const providerId = app.session(app.serviceKey(cat, service));
  return (
    <View style={styles.session}>
      {providerId ? (
        <View style={styles.identity}>
          <Text style={styles.muted}>Provider account</Text>
          <Text style={styles.sessionId}>{providerId}</Text>
        </View>
      ) : (
        <Text style={styles.muted}>Provider account · Guest</Text>
      )}
      <Button
        label={providerId ? 'Sign out' : 'Provider sign-in'}
        variant="quiet"
        small
        onPress={
          providerId ? app.providerSignOut : () => app.openPanel('provider')
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
  },
  identity: { flexShrink: 1 },
  muted: { color: colors.muted },
  sessionId: { color: colors.muted, fontWeight: '700' },
});

import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  BackLink,
  Button,
  Notice,
  Screen,
  Spinner,
} from '../components/ui';
import {colors, spacing} from '../theme/tokens';
import {useApp, type RestoreState} from '../state/store';

const messages: Record<RestoreState, string> = {
  '': 'Select the outcome for this local prototype.',
  progress: 'Restoring your eligible Device 1 sessions…',
  success: 'Restored. Open the service to see your Device 1 provider identity.',
  expired: 'The service session has expired. Sign in to the provider again.',
  unsupported: 'This provider does not support session restoration.',
  missing:
    'No eligible Device 1 session for this AIOHub user. You can prepare one in Demo controls.',
  offline: 'Device 2 is offline. Reconnect and retry.',
};
const outcomes = ['success', 'expired', 'unsupported'] as const;
const outcomeLabels = {
  success: 'Success',
  expired: 'Expired',
  unsupported: 'Unsupported',
} as const;

export default function RestoreScreen() {
  const {
    restoreState,
    outcome,
    setOutcome,
    runRestore,
    restoredOpen,
    goHome,
    restoreManual,
  } = useApp();
  return (
    <Screen>
      <BackLink label="Home" onPress={goHome} />
      <Text accessibilityRole="header" style={styles.h1}>
        Simulated restoration
      </Text>
      <Text style={styles.sub}>
        Restore a fictional provider session on Device 2. Real provider support
        still needs validation.
      </Text>
      <View style={styles.field}>
        <Text style={styles.label}>Demo outcome</Text>
        <View style={styles.selector}>
          {outcomes.map(v => {
            const active = outcome === v;
            return (
              <Pressable
                key={v}
                accessibilityRole="button"
                accessibilityLabel={outcomeLabels[v]}
                accessibilityState={{selected: active, disabled: restoreState === 'progress'}}
                disabled={restoreState === 'progress'}
                onPress={() => setOutcome(v)}
                style={[styles.option, active && styles.optionActive]}>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {outcomeLabels[v]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Notice>
        <View style={styles.noticeRow}>
          {restoreState === 'progress' && <Spinner />}
          <Text style={styles.noticeText}>{messages[restoreState]}</Text>
        </View>
      </Notice>
      {restoreState !== 'progress' && (
        <Button
          variant="primary"
          label={restoreState === 'success' || !restoreState ? 'Restore service sessions' : 'Retry'}
          onPress={runRestore}
        />
      )}
      {restoreState === 'success' && (
        <Button
          variant="tonal"
          label="Open restored service"
          onPress={restoredOpen}
        />
      )}
      {['missing', 'expired', 'unsupported'].includes(restoreState) && (
        <Button
          variant="tonal"
          label="Provider sign-in"
          onPress={restoreManual}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: {fontSize: 30, lineHeight: 34, color: colors.ink},
  sub: {color: colors.muted, fontSize: 15, lineHeight: 23},
  field: {gap: 6},
  label: {color: colors.ink, fontSize: 14, fontWeight: '700'},
  selector: {flexDirection: 'row', gap: 7},
  option: {
    flex: 1,
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionActive: {backgroundColor: colors.tonal, borderColor: colors.indigo},
  optionText: {color: colors.indigo, fontSize: 14, fontWeight: '700'},
  optionTextActive: {fontWeight: '700'},
  noticeRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  noticeText: {color: colors.indigo, flex: 1},
});

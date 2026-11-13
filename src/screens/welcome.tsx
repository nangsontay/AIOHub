import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../components/ui';
import { colors } from '../theme/tokens';
import { useApp } from '../state/store';

const sleeve = require('../assets/pocket-mixtape.webp');

export default function WelcomeScreen() {
  const { openAuthPage, startGuest } = useApp();
  return (
    <Screen style={styles.stage}>
      <View style={styles.sleeve}>
        <Image
          source={sleeve}
          style={styles.sleeveImg}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="A translucent indigo cassette with a vinyl record on a lilac background"
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.h1} accessibilityRole="header">
          {'Your media,\n'}
          <Text style={styles.h1Em}>in one place.</Text>
        </Text>
        <Text style={styles.lead}>
          Video, music, news, and games. Choose what to open from your own media
          hub.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          variant="primary"
          label="Get started"
          iconEnd="forward"
          onPress={startGuest}
        />
        <Button
          variant="second"
          label="Sign in"
          onPress={() => openAuthPage('signin')}
        />
        <Button
          variant="second"
          label="Create account"
          onPress={() => openAuthPage('register')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, gap: 0, paddingTop: 8 },
  sleeve: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: '#aba2fb',
  },
  sleeveImg: { width: '100%', height: '100%' },
  copy: { paddingTop: 22, gap: 12 },
  h1: { fontSize: 46, lineHeight: 47, fontWeight: '700', color: colors.ink },
  h1Em: { color: colors.indigo },
  lead: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  actions: { marginTop: 'auto', paddingTop: 22, gap: 8 },
});

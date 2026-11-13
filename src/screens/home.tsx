import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../components/ui';
import { Icon, type IconName } from '../components/icon';
import { colors } from '../theme/tokens';
import { cats, descriptions, type Cat } from '../state/catalog';
import { useApp } from '../state/store';

const sleeve = require('../assets/pocket-mixtape.webp');
const tileTheme: Record<Cat, { accent: string; tint: string }> = {
  Video: { accent: colors.video.accent, tint: colors.video.tint },
  Music: { accent: colors.music.accent, tint: colors.music.tint },
  News: { accent: colors.news.accent, tint: colors.news.tint },
  Game: { accent: colors.game.accent, tint: colors.game.tint },
};

export default function HomeScreen() {
  const { data, goCategory, openRestore } = useApp();
  return (
    <Screen style={styles.stage}>
      <View style={styles.homeArt}>
        <Image source={sleeve} style={styles.homeArtImg} resizeMode="cover" />
        {/* ponytail: flat fill approximates the prototype's gradient fade */}
        <View style={styles.homeArtFade} />
        <Text accessibilityRole="header" style={styles.homeArtH1}>
          Your hub
        </Text>
      </View>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={styles.h2}>
          Categories
        </Text>
        <Text style={styles.sub}>
          {data.guest
            ? 'Browsing as a guest. Choose a service to open.'
            : 'Choose a service to open.'}
        </Text>
      </View>
      <View style={styles.grid}>
        {(Object.keys(cats) as Cat[]).map(cat => (
          <Pressable
            key={cat}
            accessibilityRole="button"
            accessibilityLabel={cat + ', ' + descriptions[cat]}
            onPress={() => goCategory(cat)}
            style={[styles.tile, { backgroundColor: tileTheme[cat].tint }]}
          >
            <View style={styles.token}>
              <Icon
                name={cat.toLowerCase() as IconName}
                size={26}
                color={tileTheme[cat].accent}
              />
            </View>
            <View style={styles.arrow}>
              <Icon name="right" size={17} color={tileTheme[cat].accent} />
            </View>
            <View style={styles.tileText}>
              <Text style={styles.tileTitle}>{cat}</Text>
              <Text style={styles.tileSub}>{descriptions[cat]}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      {data.device === 'D2' && data.user && (
        <Button
          variant="tonal"
          label="Simulated restoration"
          icon="device"
          onPress={openRestore}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { gap: 16, paddingTop: 8 },
  homeArt: {
    height: 132,
    borderRadius: 18,
    backgroundColor: '#d4cafe',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  homeArtImg: {
    height: '200%',
    width: '70%',
    position: 'absolute',
    right: '-5%',
    transform: [{ rotate: '5deg' }],
  },
  homeArtFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '62%',
    backgroundColor: 'rgba(229,222,254,0.85)',
  },
  homeArtH1: {
    marginLeft: 16,
    fontSize: 36,
    lineHeight: 36,
    color: colors.ink,
  },
  head: { gap: 4 },
  h2: { fontSize: 18, fontWeight: '700', color: colors.ink },
  sub: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '47.5%',
    minHeight: 144,
    borderRadius: 17,
    padding: 16,
    paddingBottom: 20,
    justifyContent: 'flex-end',
    gap: 9,
  },
  token: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.56)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: { position: 'absolute', top: 13, right: 10 },
  tileText: { gap: 3 },
  tileTitle: { fontSize: 19, fontWeight: '700', color: '#251f32' },
  tileSub: { color: '#453f51', fontSize: 13 },
});

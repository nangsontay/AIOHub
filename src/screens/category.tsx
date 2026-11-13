import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {BackLink, Screen, StateCard} from '../components/ui';
import {Icon} from '../components/icon';
import {colors} from '../theme/tokens';
import {cats, type Cat} from '../state/catalog';
import {useApp} from '../state/store';

const theme: Record<Cat, {accent: string; tint: string}> = {
  Video: {accent: colors.video.accent, tint: colors.video.tint},
  Music: {accent: colors.music.accent, tint: colors.music.tint},
  News: {accent: colors.news.accent, tint: colors.news.tint},
  Game: {accent: colors.game.accent, tint: colors.game.tint},
};

export default function CategoryScreen() {
  const {route, held, goHome, openService} = useApp();
  const cat = route.page === 'category' ? route.cat : 'News';
  return (
    <Screen>
      <BackLink label="Home" onPress={goHome} />
      <Text accessibilityRole="header" style={styles.h1}>
        {cat}
      </Text>
      <Text style={styles.sub}>Services</Text>
      {held === 'empty' ? (
        <StateCard
          symbol="empty"
          title="No services in this category"
          text="Choose another category from Home."
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cats[cat]}
          onPress={() => openService(cat)}
          style={[styles.row, {backgroundColor: theme[cat].tint}]}>
          <View style={styles.token}>
            <Icon
              name={cat.toLowerCase() as never}
              size={26}
              color={theme[cat].accent}
            />
          </View>
          <Text style={styles.strong}>{cats[cat]}</Text>
          <View style={styles.end}>
            <Icon name="right" color={theme[cat].accent} />
          </View>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: {fontSize: 30, lineHeight: 34, color: colors.ink},
  sub: {color: colors.muted, fontSize: 15, lineHeight: 23},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 55,
    borderRadius: 13,
    padding: 12,
  },
  token: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.56)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strong: {fontSize: 17, fontWeight: '700', color: '#251f32'},
  end: {marginLeft: 'auto'},
});

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '../components/icon';
import { Button, Notice } from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/tokens';
import {
  formatTime,
  tracks,
  videos,
  videoCollections,
  musicCollections,
} from '../state/catalog';
import { useApp } from '../state/store';

export default function MediaPlayer({
  cat,
  service,
}: {
  cat: 'Video' | 'Music';
  service: string;
}) {
  const app = useApp();
  const isVideo = cat === 'Video';
  const items = isVideo
    ? videoCollections[service as keyof typeof videoCollections] || videos
    : musicCollections[service as keyof typeof musicCollections] || tracks;
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [picked, setPicked] = useState(0);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const item = items[picked];
  const matches = items
    .map((entry, i) => ({ ...entry, i }))
    .filter(entry =>
      (entry.name + ' ' + entry.by)
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  useEffect(() => {
    if (app.offline) {
      if (playing) setPlaying(false);
      return;
    }
    if (!playing) return;
    if (elapsed >= item.time) {
      setElapsed(0);
      setPlaying(false);
      return;
    }
    const id = setInterval(() => setElapsed(count => count + 1), 1000);
    return () => clearInterval(id);
  }, [playing, app.offline, elapsed, item.time]);

  const applySearch = () => {
    const query = text.trim();
    setSearch(query);
    setText(query);
  };
  const pick = (index: number) => {
    setElapsed(0);
    setPicked(index);
    setPlaying(true);
  };

  return (
    <>
      <Text accessibilityRole="header" style={styles.h1}>
        {service}
      </Text>
      {isVideo && (
        <View style={styles.search}>
          <TextInput
            accessibilityLabel="Search sample videos"
            placeholder="Search sample videos"
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={applySearch}
            returnKeyType="search"
            blurOnSubmit={false}
            style={styles.searchInput}
          />
          <Button label="Search" variant="tonal" onPress={applySearch} />
        </View>
      )}
      <View style={styles.player}>
        <View style={[styles.cover, { backgroundColor: item.color }]}>
          <Icon name={isVideo ? 'video' : 'music'} size={50} color="#ffffff" />
        </View>
        <View style={styles.playerDetails}>
          <Text style={styles.meta}>Simulated playback</Text>
          <Text style={styles.h2}>{item.name}</Text>
          <Text style={styles.muted}>{item.by}</Text>
          <View style={styles.progress}>
            <View
              style={[
                styles.fill,
                { width: (100 * elapsed) / item.time + '%' },
              ]}
            />
          </View>
          <View style={styles.titleRow}>
            <Text style={styles.meta}>
              {formatTime(elapsed)} / {formatTime(item.time)}
            </Text>
            <Button
              label={playing ? 'Pause' : 'Play'}
              variant="primary"
              icon={playing ? 'pause' : 'play'}
              onPress={() => setPlaying(value => !value)}
            />
          </View>
        </View>
      </View>
      <Text style={styles.h2}>{isVideo ? 'Videos' : 'Tracks'}</Text>
      <View style={styles.list}>
        {matches.length ? (
          matches.map(entry => (
            <Pressable
              key={entry.i}
              accessibilityRole="button"
              accessibilityLabel={entry.name + ' ' + entry.by}
              onPress={() => pick(entry.i)}
              style={[styles.item, entry.i === picked && styles.activeItem]}
            >
              <Icon name={isVideo ? 'video' : 'music'} />
              <View style={styles.itemText}>
                <Text style={styles.itemName}>{entry.name}</Text>
                <Text style={styles.meta}>{entry.by}</Text>
              </View>
              <Icon name="play" />
            </Pressable>
          ))
        ) : (
          <Notice>No videos match this search.</Notice>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: typography.title, fontWeight: '700', color: colors.ink },
  h2: { fontSize: 18, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 13, color: colors.muted },
  muted: { color: colors.muted },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
  player: {
    backgroundColor: colors.lav,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cover: { minHeight: 136, alignItems: 'center', justifyContent: 'center' },
  playerDetails: { padding: spacing.lg, gap: spacing.sm },
  progress: {
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: '#c8c2d6',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.indigo,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  list: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 55,
    borderRadius: radii.md,
    padding: spacing.sm,
    backgroundColor: colors.soft,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeItem: { borderColor: colors.indigo },
  itemText: { flex: 1, gap: 2 },
  itemName: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.ink,
  },
});

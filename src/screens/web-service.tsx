import React from 'react';
import { StyleSheet } from 'react-native';
import BrowserView from '../browser/browser-view';
import { serviceUrls } from '../state/catalog';

export default function WebService({ cat }: { cat: 'News' | 'Game' }) {
  return <BrowserView sourceUrl={serviceUrls[cat]} style={styles.browser} />;
}

const styles = StyleSheet.create({
  browser: { flex: 1 },
});

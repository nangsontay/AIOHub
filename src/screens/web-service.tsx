import React from 'react';
import { StyleSheet } from 'react-native';
import BrowserView from '../browser/browser-view';
import { serviceUrls } from '../state/catalog';

export default function WebService({ service }: { service: string }) {
  return (
    <BrowserView sourceUrl={serviceUrls[service]} style={styles.browser} />
  );
}

const styles = StyleSheet.create({
  browser: { flex: 1 },
});

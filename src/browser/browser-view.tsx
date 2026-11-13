import React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

export default function BrowserView({
  style,
}: ViewProps & { sourceUrl: string }) {
  return (
    <View style={[style, styles.container]}>
      <Text style={styles.message}>
        The browser foundation currently targets Android. An iOS browser will
        use WebKit.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', padding: 24 },
  message: { color: '#101820', fontSize: 18, lineHeight: 28 },
});

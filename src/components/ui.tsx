import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { colors } from '../theme/tokens';
import { Icon, type IconName } from './icon';
import { BrandMark } from './brand-mark';

type ButtonProps = {
  children?: React.ReactNode;
  label?: string;
  onPress?: () => void;
  variant?: 'primary' | 'second' | 'tonal' | 'quiet';
  icon?: IconName;
  iconEnd?: IconName;
  small?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};
export function Button({
  children,
  label,
  onPress,
  variant = 'second',
  icon,
  iconEnd,
  small,
  disabled,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const color = variant === 'primary' ? colors.paper : colors.indigo;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'second' && styles.second,
        variant === 'tonal' && styles.tonal,
        small && styles.small,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon && <Icon name={icon} size={18} color={color} />}
      <Text style={[styles.buttonText, { color }]}>{label ?? children}</Text>
      {iconEnd && <Icon name={iconEnd} size={18} color={color} />}
    </Pressable>
  );
}
export function BackLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Button label={label} onPress={onPress} variant="quiet" icon="left" small />
  );
}
export function BrandHeader({
  initial,
  onAccount,
  onDemo,
  offline = false,
}: {
  initial?: string;
  onAccount?: () => void;
  onDemo: () => void;
  offline?: boolean;
}) {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.brand}>
          <BrandMark size={34} />
          <Text style={styles.brandText}>AIOHub</Text>
        </View>
        <View style={styles.brand}>
          {initial && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Account menu"
              onPress={onAccount}
              style={styles.round}
            >
              <Text style={styles.buttonText}>{initial.toUpperCase()}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Demo controls"
            onPress={onDemo}
            style={styles.round}
          >
            <Icon name="more" />
          </Pressable>
        </View>
      </View>
      {offline && <Notice>Offline · Service pages are unavailable</Notice>}
    </>
  );
}
export function Spinner() {
  return <ActivityIndicator color={colors.indigo} />;
}
export function StateCard({
  symbol,
  title,
  text,
  children,
}: {
  symbol: IconName | 'loading';
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.token}>
        {symbol === 'loading' ? (
          <Spinner />
        ) : (
          <Icon name={symbol} color={colors.indigo} />
        )}
      </View>
      <Text style={styles.heading}>{title}</Text>
      {text && <Text style={styles.muted}>{text}</Text>}
      {children}
    </View>
  );
}
export function MenuRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.menu}>
      <Icon name={icon} color={colors.indigo} />
      <Text style={styles.menuText}>{label}</Text>
      <Icon name="right" color={colors.muted} />
    </Pressable>
  );
}
export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        {...props}
        style={[styles.input, !!error && styles.inputError, props.style]}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.notice}>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}
export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.screen, style]}
    >
      {children}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: colors.indigo },
  second: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tonal: { backgroundColor: colors.tonal },
  small: { minHeight: 38, paddingHorizontal: 10 },
  disabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontSize: 20, fontWeight: '800', color: colors.ink },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  state: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: colors.soft,
    borderRadius: 20,
  },
  token: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.lav,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  muted: { color: colors.muted, textAlign: 'center' },
  menu: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  menuText: { flex: 1, color: colors.ink, fontWeight: '600', fontSize: 16 },
  field: { gap: 7 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
  inputError: { borderColor: colors.err },
  error: { color: colors.err, fontSize: 13 },
  notice: { backgroundColor: colors.tonal, borderRadius: 12, padding: 14 },
  noticeText: { color: colors.indigo },
  screen: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    flexGrow: 1,
    gap: 16,
  },
});

import React, { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BackLink, Button, Field, Notice, Screen } from '../components/ui';
import { colors } from '../theme/tokens';
import { useApp, type FieldErrors } from '../state/store';

export default function AuthScreen() {
  const { route, data, notice, prefill, openAuthPage, signIn, register } =
    useApp();
  const reg = route.page === 'register';
  const [email, setEmail] = useState(prefill);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const emailRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const confirmRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const submit = async () => {
    Keyboard.dismiss();
    setPending(true);
    try {
      const result = reg
        ? await register(email, password, confirm)
        : await signIn(email, password);
      if (result) {
        setErrors(result);
        const messages = [
          result.email,
          result.password,
          result.confirm,
          result.auth,
        ].filter(Boolean);
        if (messages.length)
          AccessibilityInfo.announceForAccessibility(messages.join(' '));
        if (result.email) emailRef.current?.focus();
        else if (result.password) passwordRef.current?.focus();
        else if (result.confirm) confirmRef.current?.focus();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Screen>
      <View style={styles.backbar}>
        <BackLink label="Welcome" onPress={() => openAuthPage('welcome')} />
      </View>
      <Text accessibilityRole="header" style={styles.h1}>
        {reg ? 'Create account' : 'Sign in'}
      </Text>
      <Text style={styles.sub}>
        {reg
          ? 'Create a local AIOHub demo account. Use fictional details.'
          : 'Sign in to your AIOHub account on ' +
            (data.device === 'D2' ? 'Device 2' : 'Device 1') +
            '.'}
      </Text>
      {!!notice && <Notice>{notice}</Notice>}
      <View style={styles.form}>
        <Field
          ref={emailRef}
          label="Email"
          error={errors.email}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="username"
          keyboardType="email-address"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Field
          ref={passwordRef}
          label="Password"
          error={errors.password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={reg ? 'new-password' : 'current-password'}
          returnKeyType={reg ? 'next' : 'go'}
          blurOnSubmit={!reg}
          onSubmitEditing={reg ? () => confirmRef.current?.focus() : submit}
        />
        {reg && (
          <Field
            ref={confirmRef}
            label="Confirm password"
            error={errors.confirm}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
        )}
        {!!errors.auth && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.error}
          >
            {errors.auth}
          </Text>
        )}
        <Button
          variant="primary"
          label={reg ? 'Create account' : 'Sign in'}
          disabled={pending}
          onPress={submit}
        />
      </View>
      <View style={styles.compact}>
        {reg ? (
          <Button
            variant="quiet"
            label="Already have an account? Sign in"
            onPress={() => {
              setErrors({});
              openAuthPage('signin');
            }}
          />
        ) : (
          <Button
            variant="quiet"
            label="Create account"
            onPress={() => {
              setErrors({});
              openAuthPage('register');
            }}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backbar: { marginTop: -4, marginBottom: 6 },
  h1: { fontSize: 30, lineHeight: 34, color: colors.ink },
  sub: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  form: { gap: 15 },
  error: { color: colors.err, fontSize: 14, lineHeight: 21 },
  compact: { gap: 9 },
});

import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Wordmark } from '@/components/wordmark';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    const { error: authError } =
      mode === 'signIn'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.back();
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.content}>
        <View style={styles.wordmarkRow}>
          <Wordmark />
        </View>
        <ThemedText type="title" style={styles.heading}>
          {mode === 'signIn' ? 'Sign in' : 'Sign up'}
        </ThemedText>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, CardShadow, { backgroundColor: theme.surface, color: theme.text }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          style={[styles.input, CardShadow, { backgroundColor: theme.surface, color: theme.text }]}
        />

        {error && (
          <ThemedText themeColor="danger" style={styles.error}>
            {error}
          </ThemedText>
        )}

        <Pressable
          onPress={submit}
          disabled={busy || !email || !password}
          style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: busy ? 0.6 : 1 }]}>
          <ThemedText style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
            {busy ? 'Please wait…' : mode === 'signIn' ? 'Sign in' : 'Create account'}
          </ThemedText>
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')} style={styles.switchMode} hitSlop={8}>
          <ThemedText themeColor="primary">
            {mode === 'signIn' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.two, justifyContent: 'center' },
  wordmarkRow: { alignItems: 'center', marginBottom: Spacing.four },
  heading: { fontSize: 28, lineHeight: 34, marginBottom: Spacing.two },
  input: { borderRadius: Radius.input, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 16, minHeight: 48 },
  error: {},
  primaryButton: {
    borderRadius: Radius.input,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryButtonText: { fontWeight: '600' },
  switchMode: { alignItems: 'center', marginTop: Spacing.three },
});

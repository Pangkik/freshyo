import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMyRating, getStore, RATING_DIMENSIONS, upsertRating } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { Store } from '@/lib/types';

type DimensionKey = (typeof RATING_DIMENSIONS)[number]['key'];
type Scores = Record<DimensionKey, number | null>;

const EMPTY_SCORES: Scores = {
  ambience: null,
  accessibility: null,
  ease_of_access: null,
  cleanliness: null,
  location: null,
};

export default function RateStoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [scores, setScores] = useState<Scores>(EMPTY_SCORES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStore(id).then(setStore).catch(() => {});
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      getMyRating(id, data.session.user.id).then((mine) => {
        if (mine) {
          setScores(Object.fromEntries(RATING_DIMENSIONS.map(({ key }) => [key, mine[key]])) as Scores);
        }
      });
    });
  }, [id]);

  const canSave = RATING_DIMENSIONS.every(({ key }) => scores[key] !== null);

  async function save() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push('/auth');
      return;
    }
    setSaving(true);
    try {
      await upsertRating({ store_id: id, user_id: data.session.user.id, ...(scores as Record<DimensionKey, number>) });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (!store) {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: `Rate ${store.name}` }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {store.name}
          </ThemedText>

          {RATING_DIMENSIONS.map(({ key, label }) => (
            <View key={key} style={styles.dimensionRow}>
              <ThemedText type="default">{label}</ThemedText>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => setScores((prev) => ({ ...prev, [key]: n }))} hitSlop={8}>
                    <ThemedText
                      style={styles.star}
                      themeColor={(scores[key] ?? 0) >= n ? 'primary' : 'textSecondary'}>
                      ★
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <Pressable
          onPress={save}
          disabled={!canSave || saving}
          style={[styles.footerButton, { backgroundColor: theme.primary, opacity: canSave ? 1 : 0.4 }]}>
          <ThemedText style={[styles.footerButtonText, { color: theme.onPrimary }]}>{saving ? 'Saving…' : 'Save rating'}</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.three },
  title: { fontSize: 26, lineHeight: 32, marginBottom: Spacing.four },
  dimensionRow: { marginBottom: Spacing.four, gap: Spacing.one },
  stars: { flexDirection: 'row', gap: Spacing.two },
  star: { fontSize: 32 },
  footerButton: {
    margin: Spacing.three,
    borderRadius: Radius.input,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  footerButtonText: { fontWeight: '600' },
});

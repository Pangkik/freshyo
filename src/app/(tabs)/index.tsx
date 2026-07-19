import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Wordmark } from '@/components/wordmark';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cached } from '@/lib/cache';
import { CATEGORIES, recentItems, searchItems } from '@/lib/queries';
import { Item } from '@/lib/types';
import { useRouter } from 'expo-router';

const CATEGORY_ICON: Record<string, IconName> = {
  'canned goods': 'canned',
  noodles: 'noodles',
  dairy: 'dairy',
  condiments: 'condiments',
  household: 'household',
};

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [recent, setRecent] = useState<Item[]>([]);

  const searching = query.trim().length >= 2;

  // Small inline debounce — no library needed for a single input.
  useEffect(() => {
    if (!searching) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchItems(query.trim()).then(setResults).catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searching]);

  useEffect(() => {
    cached('recent-items', recentItems, setRecent).catch(() => {});
  }, []);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.heading}>
          <Wordmark />
        </ThemedView>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="How much is… / Tagpila ang…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.search, CardShadow, { backgroundColor: theme.surface, color: theme.text }]}
        />

        {searching ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                No matches yet. Be the first to report a price for it.
              </ThemedText>
            }
            renderItem={({ item }) => <ItemRow item={item} onPress={() => router.push(`/item/${item.id}`)} />}
          />
        ) : (
          <FlatList
            data={recent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Categories
                </ThemedText>
                <ThemedView style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => router.push(`/category/${encodeURIComponent(cat)}`)}
                      style={({ pressed }) => [
                        styles.categoryCard,
                        CardShadow,
                        { backgroundColor: theme.categoryTints[cat] ?? theme.surface, opacity: pressed ? 0.85 : 1 },
                      ]}>
                      <Icon name={CATEGORY_ICON[cat] ?? 'canned'} color={theme.text} size={28} />
                      <ThemedText type="itemName" style={styles.capitalize}>
                        {cat}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ThemedView>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Recently reported
                </ThemedText>
              </>
            }
            ListEmptyComponent={
              <ThemedView style={styles.empty}>
                <ThemedText style={styles.emptyText}>No prices reported yet.</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  Be the first to report one — it takes under 20 seconds.
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/submit')}
                  style={({ pressed }) => [styles.emptyButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}>
                  <ThemedText style={[styles.emptyButtonText, { color: theme.onPrimary }]}>Report a price</ThemedText>
                </Pressable>
              </ThemedView>
            }
            renderItem={({ item }) => <ItemRow item={item} onPress={() => router.push(`/item/${item.id}`)} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ItemRow({ item, onPress }: { item: Item; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, CardShadow, { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 }]}>
      <ThemedText type="itemName">{item.name}</ThemedText>
      <ThemedText themeColor="textSecondary" type="small">
        {[item.name_hil, item.brand, item.size_label].filter(Boolean).join(' · ') || item.category}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heading: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  search: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    minHeight: 48,
  },
  list: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  sectionTitle: { marginTop: Spacing.three, marginBottom: Spacing.two },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  categoryCard: {
    width: '47%',
    minHeight: 112,
    borderRadius: Radius.card,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  capitalize: { textTransform: 'capitalize' },
  row: { borderRadius: Radius.card, padding: Spacing.three, marginBottom: Spacing.two, gap: 2, minHeight: 48 },
  empty: { alignItems: 'center', paddingVertical: Spacing.five, gap: Spacing.one },
  emptyText: { textAlign: 'center' },
  emptyButton: {
    marginTop: Spacing.three,
    borderRadius: Radius.input,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    minHeight: 48,
    justifyContent: 'center',
  },
  emptyButtonText: { fontWeight: '600' },
});

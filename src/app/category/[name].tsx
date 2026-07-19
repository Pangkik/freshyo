import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { listItemsByCategory } from '@/lib/queries';
import { Item } from '@/lib/types';

export default function CategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    listItemsByCategory(name).then(setItems).catch(() => setItems([]));
  }, [name]);

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: name }} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedView style={styles.empty}>
            <ThemedText style={styles.emptyText}>No {name} items reported yet.</ThemedText>
            <Pressable
              onPress={() => router.push('/submit')}
              style={({ pressed }) => [styles.emptyButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}>
              <ThemedText style={[styles.emptyButtonText, { color: theme.onPrimary }]}>Report a price</ThemedText>
            </Pressable>
          </ThemedView>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/item/${item.id}`)}
            style={({ pressed }) => [styles.row, CardShadow, { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 }]}>
            <ThemedText type="itemName">{item.name}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {[item.name_hil, item.brand, item.size_label].filter(Boolean).join(' · ') || item.category}
            </ThemedText>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.three },
  row: { borderRadius: Radius.card, padding: Spacing.three, marginBottom: Spacing.two, gap: 2, minHeight: 48 },
  empty: { alignItems: 'center', paddingVertical: Spacing.five, gap: Spacing.two },
  emptyText: { textAlign: 'center' },
  emptyButton: { borderRadius: Radius.input, paddingVertical: Spacing.two, paddingHorizontal: Spacing.four, minHeight: 48, justifyContent: 'center' },
  emptyButtonText: { fontWeight: '600' },
});

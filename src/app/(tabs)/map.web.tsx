import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cached } from '@/lib/cache';
import { listStores } from '@/lib/queries';
import { Store } from '@/lib/types';

// ponytail: react-native-maps is native-only — on web the Map tab is a plain
// store list. The real map lives in map.tsx for Android/iOS.
export default function MapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    cached('stores', listStores, setStores).catch(() => {});
  }, []);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedText type="title" style={styles.heading}>
          Stores
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.note}>
          The map is on the mobile app — here's every store in Roxas.
        </ThemedText>
        <FlatList
          data={stores}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary" style={styles.note}>
              No stores yet — add one when you report a price.
            </ThemedText>
          }
          renderItem={({ item: store }) => (
            <Pressable
              onPress={() => router.push(`/store/${store.id}`)}
              style={({ pressed }) => [
                styles.row,
                CardShadow,
                { backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="itemName">{store.name}</ThemedText>
              {store.address && (
                <ThemedText themeColor="textSecondary" type="small">
                  {store.address}
                </ThemedText>
              )}
            </Pressable>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heading: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  note: { paddingHorizontal: Spacing.three, marginBottom: Spacing.two },
  list: { padding: Spacing.three },
  row: { borderRadius: Radius.card, padding: Spacing.three, marginBottom: Spacing.two, gap: 2 },
});

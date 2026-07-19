import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PriceChip } from '@/components/price-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cached } from '@/lib/cache';
import { getStore, getStorePrices, getStoreRatings, PriceReportWithItem, RATING_DIMENSIONS } from '@/lib/queries';
import { agoLabel, isStale } from '@/lib/time';
import { Rating, Store } from '@/lib/types';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [prices, setPrices] = useState<PriceReportWithItem[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    getStore(id).then(setStore).catch(() => {});
    cached(`store-prices-${id}`, () => getStorePrices(id), setPrices).catch(() => {});
    cached(`store-ratings-${id}`, () => getStoreRatings(id), setRatings).catch(() => {});
  }, [id]);

  // ponytail: latest-per-item computed client-side from the full report
  // list — same tradeoff as item detail's latest-per-store, move to a SQL
  // view if this store ever collects thousands of reports.
  const latestByItem = new Map<string, PriceReportWithItem>();
  for (const r of prices) {
    if (!latestByItem.has(r.item_id)) latestByItem.set(r.item_id, r);
  }
  const priceRows = [...latestByItem.values()];

  const means = RATING_DIMENSIONS.map(({ key }) => {
    const values = ratings.map((r) => r[key]);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  });

  if (!store) {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: store.name }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {store.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {[store.address, store.store_type].filter(Boolean).join(' · ')}
          </ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Scorecard
          </ThemedText>

          {ratings.length === 0 ? (
            <ThemedView style={styles.empty}>
              <ThemedText style={styles.emptyText}>No ratings yet — be the first to rate this store.</ThemedText>
              <Pressable
                onPress={() => router.push(`/rate/${store.id}`)}
                style={({ pressed }) => [styles.emptyButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}>
                <ThemedText style={[styles.emptyButtonText, { color: theme.onPrimary }]}>Rate this store</ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <>
              <View style={[styles.ratingCountPill, { backgroundColor: theme.surfaceSelected }]}>
                <ThemedText type="small" themeColor="primary" style={styles.ratingCountText}>
                  {ratings.length} rating{ratings.length > 1 ? 's' : ''}
                </ThemedText>
              </View>
              {RATING_DIMENSIONS.map(({ key, label }, i) => {
                const mean = means[i];
                return (
                  <View key={key} style={styles.scoreRow}>
                    <ThemedText style={styles.scoreLabel}>{label}</ThemedText>
                    <View style={[styles.barTrack, { backgroundColor: theme.surfaceSelected }]}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${((mean ?? 0) / 5) * 100}%`, backgroundColor: theme.primary },
                        ]}
                      />
                    </View>
                    <ThemedText type="smallBold" style={styles.scoreValue}>
                      {mean!.toFixed(1)}
                    </ThemedText>
                  </View>
                );
              })}
            </>
          )}

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Prices logged here
          </ThemedText>

          {priceRows.length === 0 ? (
            <ThemedView style={styles.empty}>
              <ThemedText style={styles.emptyText}>No prices reported at this store yet.</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Be the first to report one.
              </ThemedText>
            </ThemedView>
          ) : (
            priceRows.map((row) => {
              const stale = isStale(row.created_at);
              return (
                <Pressable
                  key={row.item_id}
                  onPress={() => router.push(`/item/${row.item_id}`)}
                  style={({ pressed }) => [
                    styles.row,
                    CardShadow,
                    { backgroundColor: theme.surface, opacity: stale ? 0.5 : pressed ? 0.85 : 1 },
                  ]}>
                  <View style={styles.rowInfo}>
                    <ThemedText type="itemName">
                      {[row.items.name, row.items.size_label].filter(Boolean).join(' · ')}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary" type="small">
                      {agoLabel(row.created_at)}
                    </ThemedText>
                  </View>
                  <PriceChip price={row.price} unit={row.unit} />
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={() => router.push(`/rate/${store.id}`)}
            style={({ pressed }) => [styles.footerButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}>
            <ThemedText style={[styles.footerButtonText, { color: theme.onPrimary }]}>Rate this store</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: '/submit', params: { storeId: store.id } })}
            style={({ pressed }) => [
              styles.footerButton,
              styles.footerButtonOutline,
              { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 },
            ]}>
            <ThemedText themeColor="primary">Report a price here</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.three },
  title: { fontSize: 26, lineHeight: 32 },
  sectionTitle: { fontSize: 18, lineHeight: 24, marginTop: Spacing.four, marginBottom: Spacing.two },
  ratingCountPill: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, marginBottom: Spacing.two },
  ratingCountText: { fontWeight: '700' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  scoreLabel: { width: 110 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  scoreValue: { width: 28, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.card,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  rowInfo: { gap: 2 },
  empty: { paddingVertical: Spacing.four, gap: Spacing.two, alignItems: 'flex-start' },
  emptyText: {},
  emptyButton: { borderRadius: Radius.input, paddingVertical: Spacing.two, paddingHorizontal: Spacing.four, minHeight: 48, justifyContent: 'center' },
  emptyButtonText: { fontWeight: '600' },
  footer: { flexDirection: 'row', gap: Spacing.two, padding: Spacing.three },
  footerButton: { flex: 1, borderRadius: Radius.input, paddingVertical: Spacing.three, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  footerButtonOutline: { borderWidth: 1 },
  footerButtonText: { fontWeight: '600' },
});

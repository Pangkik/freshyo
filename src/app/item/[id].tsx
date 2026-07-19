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
import { addPriceReport, getItem, getItemPrices, PriceReportWithStore } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { agoLabel, isStale } from '@/lib/time';
import { Item } from '@/lib/types';

const CHART_HEIGHT = 80;

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// One median per rolling 7-day bucket, oldest → newest, last 6 weeks.
// ponytail: "week" here is days-ago / 7, not Mon–Sun calendar weeks — good
// enough for a trend sparkline, switch to date_trunc('week', ...) in a view
// if exact calendar alignment ever matters.
function weeklyMedians(prices: PriceReportWithStore[]): (number | null)[] {
  const buckets: number[][] = [[], [], [], [], [], []];
  const now = Date.now();
  for (const r of prices) {
    const week = Math.floor((now - new Date(r.created_at).getTime()) / (7 * 86400000));
    if (week >= 0 && week < 6) buckets[week].push(r.price);
  }
  return buckets.map((b) => (b.length ? median(b) : null)).reverse();
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [prices, setPrices] = useState<PriceReportWithStore[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);

  const loadPrices = useCallback(() => {
    cached(`item-prices-${id}`, () => getItemPrices(id), setPrices).catch(() => {});
  }, [id]);

  useEffect(() => {
    getItem(id).then(setItem).catch(() => {});
    loadPrices();
  }, [id, loadPrices]);

  // ponytail: latest-per-store computed client-side from the full report
  // list — fine at v1 report volume, move to a `latest_prices` SQL view if
  // an item ever collects thousands of reports.
  const latestByStore = new Map<string, PriceReportWithStore>();
  for (const r of prices) {
    if (!latestByStore.has(r.store_id)) latestByStore.set(r.store_id, r);
  }
  const rows = [...latestByStore.values()].sort((a, b) => a.price - b.price);

  const medians = weeklyMedians(prices);
  const validMedians = medians.filter((m): m is number => m !== null);
  const min = validMedians.length ? Math.min(...validMedians) : 0;
  const max = validMedians.length ? Math.max(...validMedians) : 0;

  async function confirmPrice(row: PriceReportWithStore) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push('/auth');
      return;
    }
    setConfirming(row.id);
    try {
      await addPriceReport({
        item_id: row.item_id,
        store_id: row.store_id,
        price: row.price,
        unit: row.unit,
        note: null,
        reported_by: data.session.user.id,
      });
      loadPrices();
    } finally {
      setConfirming(null);
    }
  }

  if (!item) {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ title: item.name }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {item.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {[item.name_hil, item.brand, item.size_label, item.category].filter(Boolean).join(' · ')}
          </ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Prices near you
          </ThemedText>

          {rows.length === 0 ? (
            <ThemedView style={styles.empty}>
              <ThemedText style={styles.emptyText}>No prices reported yet for this item.</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Be the first to report one.
              </ThemedText>
            </ThemedView>
          ) : (
            rows.map((row) => {
              const stale = isStale(row.created_at);
              return (
                <View
                  key={row.store_id}
                  style={[styles.row, CardShadow, { backgroundColor: theme.surface, opacity: stale ? 0.5 : 1 }]}>
                  <View style={styles.rowInfo}>
                    <Pressable hitSlop={4} onPress={() => router.push(`/store/${row.store_id}`)}>
                      <ThemedText type="itemName">{row.stores.name}</ThemedText>
                    </Pressable>
                    <ThemedText themeColor="textSecondary" type="small">
                      {agoLabel(row.created_at)}
                    </ThemedText>
                  </View>
                  <View style={styles.rowPrice}>
                    <PriceChip price={row.price} unit={row.unit} />
                    {!stale && (
                      <Pressable
                        onPress={() => confirmPrice(row)}
                        disabled={confirming === row.id}
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.confirmButton,
                          { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 },
                        ]}>
                        <ThemedText type="small" themeColor="primary">
                          {confirming === row.id ? 'Saving…' : `Still ₱${row.price.toFixed(0)}?`}
                        </ThemedText>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}

          {validMedians.length > 0 && (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Price trend
              </ThemedText>
              <View style={styles.chartLabels}>
                <ThemedText themeColor="textSecondary" type="small">
                  ₱{min.toFixed(0)}
                </ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  ₱{max.toFixed(0)}
                </ThemedText>
              </View>
              <View style={styles.chart}>
                {medians.map((m, i) => {
                  const weeksAgo = medians.length - 1 - i;
                  const height = m === null ? 0 : max === min ? CHART_HEIGHT * 0.5 : ((m - min) / (max - min)) * CHART_HEIGHT * 0.8 + CHART_HEIGHT * 0.2;
                  return (
                    <View key={i} style={styles.chartCol}>
                      <View style={styles.chartBarTrack}>
                        {m !== null && (
                          <View style={[styles.chartBar, { height, backgroundColor: theme.primary }]} />
                        )}
                      </View>
                      <ThemedText themeColor="textSecondary" type="small">
                        {weeksAgo === 0 ? 'now' : `${weeksAgo}w`}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        <Pressable
          onPress={() => router.push({ pathname: '/submit', params: { itemId: item.id } })}
          style={({ pressed }) => [styles.footerButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}>
          <ThemedText style={[styles.footerButtonText, { color: theme.onPrimary }]}>Report a price</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.three },
  title: { fontSize: 26, lineHeight: 32 },
  sectionTitle: { fontSize: 18, lineHeight: 24, marginTop: Spacing.four, marginBottom: Spacing.two },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.card,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  rowInfo: { gap: 2 },
  rowPrice: { alignItems: 'flex-end', gap: Spacing.one },
  confirmButton: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 36,
    justifyContent: 'center',
  },
  empty: { paddingVertical: Spacing.four, gap: Spacing.one },
  emptyText: {},
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.one, height: CHART_HEIGHT + 24, marginTop: Spacing.one },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBarTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end', width: '100%' },
  chartBar: { width: '60%', alignSelf: 'center', borderRadius: 4 },
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

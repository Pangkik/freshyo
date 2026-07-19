import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addPriceReport, addStore, getItem, listStores, searchItems } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { Item, Store } from '@/lib/types';

const ROXAS_CENTER = { lat: 11.5853, lng: 122.7511 };

export default function SubmitScreen() {
  const { itemId, storeId: storeIdParam } = useLocalSearchParams<{ itemId?: string; storeId?: string }>();
  const theme = useTheme();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [itemQuery, setItemQuery] = useState('');
  const [itemResults, setItemResults] = useState<Item[]>([]);

  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<string | null>(storeIdParam ?? null);
  const [addingStore, setAddingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [savingStore, setSavingStore] = useState(false);

  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    listStores().then(setStores).catch(() => {});
  }, []);

  useEffect(() => {
    if (itemId) {
      getItem(itemId).then((found) => {
        if (found) {
          setItem(found);
          setUnit(found.unit);
        }
      });
    }
  }, [itemId]);

  useEffect(() => {
    if (itemQuery.trim().length < 2) {
      setItemResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchItems(itemQuery.trim()).then(setItemResults).catch(() => setItemResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [itemQuery]);

  function pickItem(picked: Item) {
    setItem(picked);
    setUnit(picked.unit);
    setItemQuery('');
    setItemResults([]);
  }

  async function saveStore() {
    if (!newStoreName.trim()) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push('/auth');
      return;
    }
    setSavingStore(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let coords = ROXAS_CENTER;
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocationNote(null);
      } else {
        setLocationNote('Location permission denied — used Roxas City center instead.');
      }
      const created = await addStore({
        name: newStoreName.trim(),
        lat: coords.lat,
        lng: coords.lng,
        address: newStoreAddress.trim() || null,
      });
      setStores((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setStoreId(created.id);
      setAddingStore(false);
      setNewStoreName('');
      setNewStoreAddress('');
    } catch {
      setError('Could not add that store. Try again.');
    } finally {
      setSavingStore(false);
    }
  }

  const priceValue = parseFloat(price);
  const canSubmit = !!item && !!storeId && price.trim().length > 0 && priceValue > 0;

  async function handleSubmit() {
    if (!item || !storeId) return;
    setError(null);
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push('/auth');
      return;
    }
    setSubmitting(true);
    try {
      await addPriceReport({
        item_id: item.id,
        store_id: storeId,
        price: priceValue,
        unit: unit.trim() || item.unit,
        note: note.trim() || null,
        reported_by: data.session.user.id,
      });
      setSuccess(true);
    } catch {
      setError('Could not submit that price. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reportAnother() {
    setItem(null);
    setStoreId(null);
    setPrice('');
    setUnit('');
    setNote('');
    setSuccess(false);
    setError(null);
  }

  if (success && item) {
    return (
      <ThemedView style={styles.flex}>
        <SafeAreaView style={styles.center}>
          <ThemedText type="subtitle" style={styles.centerText}>
            Price reported!
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Thanks for helping the community find better prices.
          </ThemedText>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={reportAnother}>
            <ThemedText style={[styles.primaryButtonText, { color: theme.onPrimary }]}>Report another</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push(`/item/${item.id}`)}>
            <ThemedText themeColor="primary">View item</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={styles.heading}>
              Report a price
            </ThemedText>

            <ThemedText type="smallBold" style={styles.stepLabel}>
              1. Item
            </ThemedText>
            {item ? (
              <Pressable
                onPress={() => setItem(null)}
                style={[styles.selected, { backgroundColor: theme.surfaceSelected }]}>
                <ThemedText type="itemName">{item.name}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  Change
                </ThemedText>
              </Pressable>
            ) : (
              <>
                <TextInput
                  value={itemQuery}
                  onChangeText={setItemQuery}
                  placeholder="Search for an item…"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, CardShadow, { backgroundColor: theme.surface, color: theme.text }]}
                />
                {itemResults.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => pickItem(r)}
                    style={({ pressed }) => [styles.optionRow, { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 }]}>
                    <ThemedText type="itemName">{r.name}</ThemedText>
                    <ThemedText themeColor="textSecondary" type="small">
                      {[r.name_hil, r.brand, r.size_label].filter(Boolean).join(' · ')}
                    </ThemedText>
                  </Pressable>
                ))}
              </>
            )}

            <ThemedText type="smallBold" style={styles.stepLabel}>
              2. Store
            </ThemedText>
            {stores.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setStoreId(s.id)}
                style={({ pressed }) => [
                  styles.optionRow,
                  { backgroundColor: s.id === storeId ? theme.surfaceSelected : theme.surface, opacity: pressed ? 0.85 : 1 },
                ]}>
                <ThemedText type="itemName">{s.name}</ThemedText>
                {s.address && (
                  <ThemedText themeColor="textSecondary" type="small">
                    {s.address}
                  </ThemedText>
                )}
              </Pressable>
            ))}
            {addingStore ? (
              <View style={[styles.optionRow, { backgroundColor: theme.surface }]}>
                <TextInput
                  value={newStoreName}
                  onChangeText={setNewStoreName}
                  placeholder="Store name"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { backgroundColor: theme.surfaceSelected, color: theme.text }]}
                />
                <TextInput
                  value={newStoreAddress}
                  onChangeText={setNewStoreAddress}
                  placeholder="Address (optional)"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { backgroundColor: theme.surfaceSelected, color: theme.text }]}
                />
                {locationNote && (
                  <ThemedText themeColor="textSecondary" type="small">
                    {locationNote}
                  </ThemedText>
                )}
                <Pressable
                  onPress={saveStore}
                  disabled={savingStore || !newStoreName.trim()}
                  style={[styles.secondaryButton, { borderColor: theme.primary }]}>
                  <ThemedText themeColor="primary">{savingStore ? 'Saving…' : 'Save store'}</ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setAddingStore(true)} style={styles.addStoreRow} hitSlop={8}>
                <ThemedText themeColor="primary">+ Add a store</ThemedText>
              </Pressable>
            )}

            <ThemedText type="smallBold" style={styles.stepLabel}>
              3. Price
            </ThemedText>
            <View style={styles.priceRow}>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                style={[styles.input, styles.priceInput, CardShadow, { backgroundColor: theme.surface, color: theme.text }]}
              />
              <TextInput
                value={unit}
                onChangeText={setUnit}
                placeholder="unit"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, styles.unitInput, CardShadow, { backgroundColor: theme.surface, color: theme.text }]}
              />
            </View>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Note (optional)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, CardShadow, { backgroundColor: theme.surface, color: theme.text }]}
            />

            {error && (
              <ThemedText themeColor="danger" style={styles.error}>
                {error}
              </ThemedText>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: canSubmit ? 1 : 0.4 }]}>
              <ThemedText style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
                {submitting ? 'Submitting…' : 'Submit price'}
              </ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.four, gap: Spacing.two },
  centerText: { textAlign: 'center' },
  content: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.two },
  heading: { fontSize: 28, lineHeight: 34, marginBottom: Spacing.two },
  stepLabel: { marginTop: Spacing.three },
  input: { borderRadius: Radius.input, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 16, minHeight: 48 },
  optionRow: { borderRadius: Radius.card, padding: Spacing.three, gap: 2, minHeight: 48 },
  selected: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  addStoreRow: { paddingVertical: Spacing.two, minHeight: 48, justifyContent: 'center' },
  priceRow: { flexDirection: 'row', gap: Spacing.two },
  priceInput: { flex: 2 },
  unitInput: { flex: 1 },
  error: {},
  primaryButton: {
    borderRadius: Radius.input,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryButtonText: { fontWeight: '600' },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: Radius.input,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
    minHeight: 48,
    justifyContent: 'center',
  },
});

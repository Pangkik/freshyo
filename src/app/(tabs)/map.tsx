import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cached } from '@/lib/cache';
import { listStores } from '@/lib/queries';
import { Store } from '@/lib/types';

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
        <MapView
          style={styles.flex}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 11.5853,
            longitude: 122.7511,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}>
          {stores.map((store) => (
            <Marker
              key={store.id}
              coordinate={{ latitude: store.lat, longitude: store.lng }}
              title={store.name}
              onCalloutPress={() => router.push(`/store/${store.id}`)}
              onPress={() => router.push(`/store/${store.id}`)}
            />
          ))}
        </MapView>
        {stores.length === 0 && (
          <ThemedView style={[styles.overlay, CardShadow, { backgroundColor: theme.surface }]}>
            <ThemedText themeColor="textSecondary" type="small">
              No stores yet — add one when you report a price
            </ThemedText>
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    right: Spacing.two,
    borderRadius: Radius.card,
    padding: Spacing.three,
  },
});

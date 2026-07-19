import { StyleSheet, Text, View } from 'react-native';

import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

// Shared price chip — bold ₱ price + unit, used everywhere a price shows
// (item detail rows, store detail rows). Green-on-mint in light mode; the
// primary green itself only clears 4.5:1 text contrast against the mint tint
// in dark mode, so light mode uses a deeper green instead.
export function PriceChip({ price, unit }: { price: number; unit: string }) {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? theme.primary : '#0B7A46';

  return (
    <View style={[styles.chip, { backgroundColor: theme.categoryTints['canned goods'] }]}>
      <Text style={[styles.text, { color: textColor }]}>
        ₱{price.toFixed(2)} {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
  text: { fontFamily: FontFamily.heading, fontSize: 14 },
});

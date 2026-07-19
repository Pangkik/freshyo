import { StyleSheet, Text, View } from 'react-native';

import { FontFamily } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Text-based logo — "FRESH" in primary green + "yo" in the text color.
export function Wordmark({ size = 28 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { fontSize: size, color: theme.primary }]}>FRESH</Text>
      <Text style={[styles.text, { fontSize: size, color: theme.text }]}>yo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  text: { fontFamily: FontFamily.heading },
});

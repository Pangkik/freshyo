import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'itemName' | 'title' | 'small' | 'smallBold' | 'subtitle';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'itemName' && styles.itemName,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  // Bold item/store names in list rows — body copy otherwise stays the system font.
  itemName: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 700,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: 40,
    lineHeight: 46,
  },
  subtitle: {
    fontFamily: FontFamily.headingMedium,
    fontSize: 26,
    lineHeight: 34,
  },
});

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ColorValue } from 'react-native';

const GLYPHS = {
  home: 'home',
  submit: 'plus-circle-outline',
  map: 'map-marker',
  canned: 'food-variant',
  noodles: 'noodles',
  dairy: 'cup',
  condiments: 'bottle-tonic',
  household: 'spray-bottle',
} as const;

export type IconName = keyof typeof GLYPHS;

export function Icon({ name, size = 24, color }: { name: IconName; size?: number; color: ColorValue }) {
  return <MaterialCommunityIcons name={GLYPHS[name]} size={size} color={color} />;
}

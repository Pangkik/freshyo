/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * For other styling: Spacing is the 4/8px scale, Radius is the corner-radius scale
 * (claymorphism-lite: generous rounded corners), CardShadow is the shared soft
 * drop shadow for elevated cards/rows, and FontFamily maps to the loaded
 * Space Grotesk weights (headings/prices/wordmark only — body text stays system font).
 */

// Category pastel tints — dark text sits on the light-mode tints, light text
// sits on the dark-mode (desaturated deep) tints. Keyed to CATEGORIES in
// lib/queries.ts.
const categoryTintsLight = {
  'canned goods': '#DCF3E4',
  noodles: '#FBF0D4',
  dairy: '#DEEFFA',
  condiments: '#FBE2EA',
  household: '#EAE4F7',
} as const;

const categoryTintsDark = {
  'canned goods': '#1F3A2C',
  noodles: '#3A3322',
  dairy: '#1E3140',
  condiments: '#3C2630',
  household: '#2C2740',
} as const;

export type CategoryName = keyof typeof categoryTintsLight;

export const Colors = {
  light: {
    text: '#1A2E22',
    textSecondary: '#5C6F63',
    background: '#FDFBF7',
    surface: '#FFFFFF',
    surfaceSelected: categoryTintsLight['canned goods'],
    primary: '#0E9F5D',
    onPrimary: '#FFFFFF',
    danger: '#C43D3D',
    categoryTints: categoryTintsLight as Record<string, string>,
  },
  dark: {
    text: '#E8F0EA',
    textSecondary: '#93A69A',
    background: '#121814',
    surface: '#1C2420',
    surfaceSelected: categoryTintsDark['canned goods'],
    primary: '#34C77D',
    onPrimary: '#0B1410',
    danger: '#FF6B6B',
    categoryTints: categoryTintsDark as Record<string, string>,
  },
} as const;

// Excludes categoryTints — that's a nested record, not a single color value.
export type ThemeColor = Exclude<keyof typeof Colors.light & keyof typeof Colors.dark, 'categoryTints'>;

// Space Grotesk — headings, prices, and the wordmark only. Loaded via
// useFonts in src/app/_layout.tsx.
export const FontFamily = {
  heading: 'SpaceGrotesk_700Bold',
  headingMedium: 'SpaceGrotesk_500Medium',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Claymorphism-lite corner scale: 12px inputs/buttons, 20px cards, pill chips.
export const Radius = {
  input: 12,
  card: 20,
  pill: 999,
} as const;

// Shared soft, low-opacity drop shadow for elevated cards/rows — no hard lines.
export const CardShadow = {
  shadowColor: '#1A2E22',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
} as const;

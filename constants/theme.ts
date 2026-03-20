import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0D1B2A',
    subtext: '#5A6A7A',
    background: '#F0F4FF',
    card: '#FFFFFF',
    border: '#DDE5F0',
    tint: '#1565C0',
    tabIconDefault: '#8FA3B8',
    tabIconSelected: '#1565C0',
    icon: '#5A6A7A',
    primary: '#1565C0',
    primaryLight: '#E8F0FE',
    accent: '#1E88E5',
    success: '#2E7D32',
    successLight: '#E8F5E9',
    warning: '#E65100',
    warningLight: '#FFF3E0',
    danger: '#C62828',
    dangerLight: '#FFEBEE',
  },
  dark: {
    text: '#E8EFF8',
    subtext: '#8FA3B8',
    background: '#0D1B2A',
    card: '#162030',
    border: '#1E3048',
    tint: '#4A90D9',
    tabIconDefault: '#5A6A7A',
    tabIconSelected: '#4A90D9',
    icon: '#8FA3B8',
    primary: '#4A90D9',
    primaryLight: '#1A2E45',
    accent: '#5BA3E8',
    success: '#4CAF50',
    successLight: '#1B3A1C',
    warning: '#FF9800',
    warningLight: '#3A2A10',
    danger: '#EF5350',
    dangerLight: '#3A1515',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

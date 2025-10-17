import { View, type ViewProps, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const combinedStyle = StyleSheet.flatten([{ backgroundColor }, style]);
  return <View style={combinedStyle} {...otherProps} />;
}

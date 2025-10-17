import React from 'react';
import { View, StyleSheet, ViewStyle, FlexStyle } from 'react-native';

interface GridProps {
  children: React.ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  spacing?: number;
  style?: ViewStyle;
}

export default function Grid({ 
  children, 
  container = false, 
  item = false, 
  xs = 12, 
  sm = xs, 
  md = sm, 
  lg = md,
  spacing = 0,
  style 
}: GridProps) {
  const getFlexBasis = (): number => {
    // Simple responsive breakpoint logic
    // In a real app, you'd use device dimensions
    return (xs / 12) * 100;
  };

  const containerStyle = container ? {
    flexDirection: 'row' as FlexStyle['flexDirection'],
    flexWrap: 'wrap' as FlexStyle['flexWrap'],
    marginHorizontal: -spacing / 2,
  } : {};

  const itemStyle = item ? {
    flexBasis: `${getFlexBasis()}%` as unknown as number,
    maxWidth: `${getFlexBasis()}%` as unknown as number,
    paddingHorizontal: spacing / 2,
    marginBottom: spacing,
  } : {};

  return (
    <View style={[containerStyle, itemStyle, style]}>
      {children}
    </View>
  );
}



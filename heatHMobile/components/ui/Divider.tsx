import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  thickness?: number;
}

export default function Divider({ style, color = '#e0e0e0', thickness = 1 }: DividerProps) {
  return (
    <View style={[styles.divider, { backgroundColor: color, height: thickness }, style]} />
  );
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    marginVertical: 16,
  },
});



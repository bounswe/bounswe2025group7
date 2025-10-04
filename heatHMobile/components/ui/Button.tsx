import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'text';
  style?: ViewStyle;
}

export default function Button({ title, onPress, disabled = false, variant = 'default', style }: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      padding: 12,
      borderRadius: 8,
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#0a7ea4',
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          padding: 8,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#0a7ea4',
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
        return { color: '#0a7ea4', textAlign: 'center' };
      case 'text':
        return { color: '#0a7ea4', textAlign: 'center' };
      default:
        return { color: '#fff', textAlign: 'center' };
    }
  };

  return (
    <Pressable 
      onPress={disabled ? undefined : onPress} 
      style={[getButtonStyle(), style]}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
}



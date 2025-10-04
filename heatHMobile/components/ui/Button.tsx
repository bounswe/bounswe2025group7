import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({ 
  title, 
  onPress, 
  disabled = false, 
  style, 
  textStyle 
}: ButtonProps) {
  return (
    <Pressable 
      onPress={disabled ? undefined : onPress} 
      style={[
        styles.button, 
        disabled && styles.disabled,
        style
      ]}
    >
      <Text style={[styles.text, disabled && styles.disabledText, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  disabledText: {
    color: '#666',
  },
});



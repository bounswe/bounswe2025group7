import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({ 
  title, 
  onPress, 
  disabled = false, 
  style, 
  textStyle 
}: ButtonProps) {
  const flattened = StyleSheet.flatten(style) as ViewStyle | undefined;
  const isLinkButton = flattened && flattened.backgroundColor === 'transparent';
  
  return (
    <Pressable 
      onPress={disabled ? undefined : onPress} 
      style={[
        styles.button, 
        disabled && styles.disabled,
        isLinkButton && styles.linkButton,
        style
      ]}
    >
      <Text style={[
        styles.text, 
        disabled && styles.disabledText,
        isLinkButton && styles.linkText,
        textStyle
      ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: '#127e5e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#127e5e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: {
    backgroundColor: '#a0a0a0',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledText: {
    color: '#666',
  },
  linkButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#127e5e',
    shadowOpacity: 0,
    elevation: 0,
  },
  linkText: {
    color: '#127e5e',
  },
});



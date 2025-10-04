import { TextInput, TextInputProps } from 'react-native';

export default function Input(props: TextInputProps) {
  return <TextInput {...props} style={[{ padding: 12, borderWidth: 1, borderRadius: 8 }, props.style]} />;
}



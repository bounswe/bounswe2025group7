import { Text } from 'react-native';

export default function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={{ color: 'red' }}>{message}</Text>;
}



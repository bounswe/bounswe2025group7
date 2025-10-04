import { Pressable, Text } from 'react-native';

export default function Button({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ padding: 12, backgroundColor: '#0a7ea4', borderRadius: 8 }}>
      <Text style={{ color: '#fff', textAlign: 'center' }}>{title}</Text>
    </Pressable>
  );
}



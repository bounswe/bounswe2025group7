import { Pressable, Text } from 'react-native';

export default function Button({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ padding: 12, backgroundColor: '#169873ff', borderRadius: 8 }}>
      <Text style={{ color: '#fff', textAlign: 'center' }}>{title}</Text>
    </Pressable>
  );
}



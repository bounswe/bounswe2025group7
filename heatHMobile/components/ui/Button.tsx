import { Pressable } from 'react-native';
import {ThemedText} from '@/components/themed-text'

export default function Button({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ padding: 12, backgroundColor: '#169873ff', borderRadius: 8 }}>
      <ThemedText style={{ color: '#fff', textAlign: 'center' }}>{title}</ThemedText>
    </Pressable>
  );
}



import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  return (
    <ThemedView>
      <ThemedText>Profile: {username}</ThemedText>
    </ThemedView>
  );
}



import Avatar from './Avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileHeader({ username }: { username: string }) {
  return (
    <ThemedView>
      <Avatar />
      <ThemedText>{username}</ThemedText>
    </ThemedView>
  );
}



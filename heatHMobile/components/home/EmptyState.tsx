import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function EmptyState({ message = 'No items' }: { message?: string }) {
  return (
    <ThemedView>
      <ThemedText>{message}</ThemedText>
    </ThemedView>
  );
}



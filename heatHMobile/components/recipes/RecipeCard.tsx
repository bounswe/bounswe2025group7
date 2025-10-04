import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RecipeCard({ title }: { title: string }) {
  return (
    <ThemedView>
      <ThemedText>{title}</ThemedText>
    </ThemedView>
  );
}



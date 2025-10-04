import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ThemedView>
      <ThemedText>Recipe Detail: {id}</ThemedText>
    </ThemedView>
  );
}



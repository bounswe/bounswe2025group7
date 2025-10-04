import { FlatList } from 'react-native';
import RecipeCard from './RecipeCard';

export default function RecipeList({ data }: { data: { id: string; title: string }[] }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RecipeCard title={item.title} />}
    />
  );
}



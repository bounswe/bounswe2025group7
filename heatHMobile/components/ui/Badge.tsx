import { Text, View } from 'react-native';

export default function Badge({ label }: { label: string }) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#eee', borderRadius: 999 }}>
      <Text>{label}</Text>
    </View>
  );
}



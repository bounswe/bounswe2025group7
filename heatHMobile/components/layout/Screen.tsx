import { ReactNode } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

export default function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  if (scroll) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>{children}</ScrollView>
      </SafeAreaView>
    );
  }
  return <SafeAreaView style={{ flex: 1, padding: 16 }}>{children}</SafeAreaView>;
}



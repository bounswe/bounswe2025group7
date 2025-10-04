import { ReactNode } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeSection({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <ThemedView>
      <ThemedText type="subtitle">{title}</ThemedText>
      {children}
    </ThemedView>
  );
}



import { ReactNode } from 'react';
import { View } from 'react-native';

export default function Section({ children }: { children: ReactNode }) {
  return <View style={{ marginBottom: 16 }}>{children}</View>;
}



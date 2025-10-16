import { ReactNode, useMemo } from 'react';
import { ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
}

export default function Screen({ 
  children, 
  scroll = true, 
  backgroundColor,
}: ScreenProps) {
  const themedBackground = useThemeColor({}, 'background');
  const bg = backgroundColor ?? themedBackground;
  const barStyle = useMemo(() => (themedBackground === '#151718' ? 'light-content' as const : 'dark-content' as const), [themedBackground]);

  if (scroll) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <StatusBar barStyle={barStyle} backgroundColor={bg} translucent={false} />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={barStyle} backgroundColor={bg} translucent={false} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});



import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, StatusBar } from 'react-native';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
}

export default function Screen({ 
  children, 
  scroll = true, 
  backgroundColor = '#f8f9fa' 
}: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
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



import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import HomeHeader from '@/components/home/HomeHeader';
import HomeFeed from '@/components/home/HomeFeed';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <HomeHeader />
        <HomeFeed />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

import { StyleSheet, SafeAreaView, View } from 'react-native';
import HomeHeader from '@/components/home/HomeHeader';
import HomeFeed from '@/components/home/HomeFeed';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HomeHeader />
        <HomeFeed />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

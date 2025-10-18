import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, FlatList, Alert, TouchableOpacity } from 'react-native';
import { colors, textColors } from '../../constants/theme';
import { feedService } from '../../services/feedService';
import FeedCard from '@/components/feedCard';

export default function HomeScreen() {
  const [feeds, setFeeds] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const data = await feedService.getRecentFeeds(0);
      console.log(`Loaded ${data.length} feeds for initial load.`);
      setFeeds(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log(`Refreshing feed page.`);
      const data = await feedService.getRecentFeeds(0);
      setFeeds(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to refresh feeds');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      await loadInitial();
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recent feeds...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // If the API might return a non-array, normalize to [] for FlatList
  const feedArray = Array.isArray(feeds) ? feeds : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Feeds</Text>
      <FlatList
        data={feedArray}
        keyExtractor={(item: any) => String(item.id ?? Math.random())}
        renderItem={({ item }) => <FeedCard feed={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No feeds found.</Text>}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          const jsonString = JSON.stringify(feeds, null, 2);
          Alert.alert('Recent Feeds - Raw JSON', jsonString, [{ text: 'OK' }], {
            cancelable: true,
          });
        }}
      >
        <Text style={styles.subTitle}>Raw JSON (debug) - Tap to open</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text selectable style={styles.jsonText}>{JSON.stringify(feeds, null, 2)}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: textColors.secondary,
    marginTop: 12,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyText: {
    color: textColors.secondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    color: textColors.secondary,
  },
  errorText: {
    color: colors.error,
  },
  scroll: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  scrollContent: {
    padding: 12,
  },
  jsonText: {
    color: colors.gray[800],
    fontSize: 12,
  },
});


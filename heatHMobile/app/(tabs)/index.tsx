import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { feedService } from '../../services/feedService';
import FeedCard from '@/components/feedCard';

export default function HomeScreen() {
  const { colors, textColors, fonts, lineHeights } = useThemeColors();
  const [feeds, setFeeds] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const data = await feedService.getRecentFeeds(0);
      console.log(`Loaded ${data.length} feeds for initial load.`);
      setFeeds(data);
      setPage(1);
      setHasMore(Array.isArray(data) ? data.length > 0 : false);
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
      setPage(1);
      setHasMore(Array.isArray(data) ? data.length > 0 : false);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to refresh feeds');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data = await feedService.getRecentFeeds(page);
      console.log(`Loaded ${Array.isArray(data) ? data.length : 0} feeds for page ${page}.`);
      const nextItems = Array.isArray(data) ? data : [];
      if (nextItems.length === 0) {
        setHasMore(false);
      } else {
        setFeeds((prev: any) => (Array.isArray(prev) ? [...prev, ...nextItems] : nextItems));
        setPage((p) => p + 1);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load more feeds');
    } finally {
      setLoadingMore(false);
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>Loading recent feeds...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  // If the API might return a non-array, normalize to [] for FlatList
  const feedArray = Array.isArray(feeds) ? feeds : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>Recent Feeds</Text>
      <FlatList
        data={feedArray}
        keyExtractor={(item: any) => String(item.id ?? Math.random())}
        renderItem={({ item }) => <FeedCard feed={item} />}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>No feeds found.</Text>}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        ListFooterComponent={loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.footerText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>Loading more...</Text>
          </View>
        ) : null}
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
        <Text style={[styles.subTitle, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>Raw JSON (debug) - Tap to open</Text>
      </TouchableOpacity>
      <ScrollView style={[styles.scroll, { borderColor: colors.gray[200], backgroundColor: colors.white }]} contentContainerStyle={styles.scrollContent}>
        <Text selectable style={[styles.jsonText, { color: colors.gray[800] }]}>{JSON.stringify(feeds, null, 2)}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 8,
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 6,
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    // Dynamic styling applied in component
  },
  scroll: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
  },
  scrollContent: {
    padding: 12,
  },
  jsonText: {
    fontSize: 12,
  },
});


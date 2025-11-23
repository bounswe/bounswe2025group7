import React, { useEffect, useState } from 'react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, FlatList, Alert, TouchableOpacity, TextInput, Image } from 'react-native';
import { colors, textColors } from '../../constants/theme';
import { feedService } from '../../services/feedService';
import FeedCard from '@/components/feedCard';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { colors, textColors, fonts, lineHeights } = useThemeColors();
  const { t } = useTranslation();
  const [feeds, setFeeds] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [newPostText, setNewPostText] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageDataUri, setSelectedImageDataUri] = useState<string | null>(null);

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

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('alerts.permissionRequired'), t('alerts.photoLibraryPermission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
        selectionLimit: 1,
      });

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;

      const mime = (asset as any).mimeType || 'image/jpeg';
      const base64 = asset.base64;
      if (!base64) {
        Alert.alert(t('common.error'), t('alerts.failedToPickImage'));
        return;
      }
      const dataUri = `data:${mime};base64,${base64}`;
      setSelectedImageUri(asset.uri);
      setSelectedImageDataUri(dataUri);
    } catch (e: any) {
      const msg = e?.message || 'Failed to select image';
      Alert.alert('Error', msg);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImageUri(null);
    setSelectedImageDataUri(null);
  };

  const handleCreateFeed = async () => {
    const text = newPostText.trim();
    if (!text && !selectedImageDataUri) {
      return;
    }
    if (creating) return;
    setCreating(true);
    try {
      const hasImage = !!selectedImageDataUri;
      const payload: any = hasImage
        ? { type: 'IMAGE_AND_TEXT', text, image: selectedImageDataUri }
        : { type: 'TEXT', text };
      await feedService.createFeed(payload);
      // Always refresh from server after creating
      setNewPostText('');
      clearSelectedImage();
      await handleRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create feed';
      Alert.alert('Error', msg);
    } finally {
      setCreating(false);
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
        <Text style={[styles.loadingText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{t('feed.loadingFeeds')}</Text>
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
      <Text style={[styles.title, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>{t('feed.recentFeeds')}</Text>
      <FlatList
        data={feedArray}
        keyExtractor={(item: any) => String(item.id ?? Math.random())}
        renderItem={({ item }) => <FeedCard feed={item} />}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{t('feed.noFeeds')}</Text>}
        ListHeaderComponent={(
          <View style={styles.composeCard}>
            <TextInput
              value={newPostText}
              onChangeText={setNewPostText}
              placeholder={t('feed.whatsOnMind')}
              placeholderTextColor={textColors.secondary}
              multiline
              style={styles.composeInput}
              editable={!creating}
            />
            {!!selectedImageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} resizeMode="cover" />
                <TouchableOpacity onPress={clearSelectedImage} style={styles.removeImageBtn} activeOpacity={0.7}>
                  <Ionicons name="close" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.composeActions}>
              <TouchableOpacity activeOpacity={0.7} onPress={pickImageFromGallery} style={styles.mediaButton} disabled={creating}>
                <Ionicons name="image-outline" size={18} color={textColors.secondary} />
                <Text style={[
                  styles.mediaButtonText,
                  { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }
                ]}>{t('feed.photo')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCreateFeed}
                disabled={creating || (newPostText.trim().length === 0 && !selectedImageUri)}
                style={[
                  styles.postButton,
                  { backgroundColor: colors.primary },
                  (creating || (newPostText.trim().length === 0 && !selectedImageUri)) && { backgroundColor: colors.gray[300] },
                ]}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={[
                    styles.postButtonText,
                    { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base }
                  ]}>{t('feed.post')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        ListFooterComponent={loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.footerText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{t('feed.loadingMore')}</Text>
          </View>
        ) : null}
      />
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
  composeCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  composeInput: {
    color: textColors.primary,
    minHeight: 36,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    marginTop: 8,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.gray[800],
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  mediaButtonText: {
    color: textColors.secondary,
    fontSize: 11,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  postButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  postButtonText: {
    color: colors.white,
    fontWeight: '600',
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


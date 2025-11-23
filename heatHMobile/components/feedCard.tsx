import { useThemeColors } from '../hooks/useThemeColors';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Animated, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, textColors } from '@/constants/theme';
import { feedService } from '@/services/feedService';
import { recipeService } from '@/services/recipeService';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { translateTextContent, mapLanguageToRecipeTarget } from '../services/translationService';

type FeedResponse = {
  id: number;
  userId: number;
  type: 'TEXT' | 'IMAGE_AND_TEXT' | 'RECIPE';
  text?: string | null;
  image?: string | null;
  recipe?: any;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
  likedByCurrentUser?: boolean;
  name?: string;
  surname?: string;
  profilePhoto?: string;
};

type FeedCardProps = {
  feed: FeedResponse;
};

export const FeedCard: React.FC<FeedCardProps> = ({ feed }) => {
  const { colors, textColors, fonts, lineHeights } = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const fullName = [feed.name, feed.surname].filter(Boolean).join(' ') || 'User';
  const created = feed.createdAt ? (() => {
    const lang = i18n.language || 'en';
    let locale = 'en-US';
    if (lang.startsWith('tr')) locale = 'tr-TR';
    else if (lang.startsWith('ja')) locale = 'ja-JP';
    return new Date(feed.createdAt).toLocaleString(locale);
  })() : '';
  const imageUri =
    feed.type === 'RECIPE' ? feed?.recipe?.photo ?? null :
    feed.type === 'IMAGE_AND_TEXT' ? feed?.image ?? null :
    null;

  const [likedByCurrentUser, setLikedByCurrentUser] = useState<boolean>(!!feed.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState<number>(feed.likeCount ?? 0);
  const [savedByCurrentUser, setSavedByCurrentUser] = useState<boolean>(false);
  const [commentsVisible, setCommentsVisible] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [translatedComments, setTranslatedComments] = useState<any[]>([]);
  const [commentMessage, setCommentMessage] = useState<string>('');
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(feed.commentCount ?? 0);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translatingText, setTranslatingText] = useState<boolean>(false);
  const likeScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;

  // Check if recipe is saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (feed.type === 'RECIPE' && feed.recipe?.id) {
        try {
          const isSaved = await recipeService.isRecipeSaved(feed.recipe.id);
          setSavedByCurrentUser(isSaved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };

    checkSavedStatus();
  }, [feed.type, feed.recipe?.id]);

  // Translate feed text when language changes
  useEffect(() => {
    if (!feed.text) {
      setTranslatedText(null);
      return;
    }

    let cancelled = false;
    const translateFeedText = async () => {
      setTranslatingText(true);
      try {
        const targetLang = mapLanguageToRecipeTarget(i18n.language);
        const translated = await translateTextContent(feed.text!, targetLang);
        if (!cancelled) {
          setTranslatedText(translated);
        }
      } catch (error) {
        if (!cancelled) {
          setTranslatedText(null);
        }
      } finally {
        if (!cancelled) {
          setTranslatingText(false);
        }
      }
    };

    translateFeedText();
    return () => {
      cancelled = true;
    };
  }, [feed.text, i18n.language]);

  // Translate comments when they change or language changes
  useEffect(() => {
    if (comments.length === 0) {
      setTranslatedComments([]);
      return;
    }

    let cancelled = false;
    const translateComments = async () => {
      try {
        const targetLang = mapLanguageToRecipeTarget(i18n.language);
        const translated = await Promise.all(
          comments.map(async (comment) => {
            if (!comment.message) return comment;
            try {
              const translatedMessage = await translateTextContent(comment.message, targetLang);
              return { ...comment, message: translatedMessage };
            } catch {
              return comment;
            }
          })
        );
        if (!cancelled) {
          setTranslatedComments(translated);
        }
      } catch (error) {
        if (!cancelled) {
          setTranslatedComments(comments);
        }
      }
    };

    translateComments();
    return () => {
      cancelled = true;
    };
  }, [comments, i18n.language]);

  const bumpLike = () => {
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const bumpSave = () => {
    Animated.sequence([
      Animated.timing(saveScale, {
        toValue: 1.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(saveScale, {
        toValue: 1,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggleLike = async () => {
    const doLike = async () => {
      await feedService.likeFeed(feed.id);
      setLikedByCurrentUser(true);
      setLikeCount((c) => c + 1);
      bumpLike();
    };

    const doUnlike = async () => {
      await feedService.unlikeFeed(feed.id);
      setLikedByCurrentUser(false);
      setLikeCount((c) => Math.max(0, c - 1));
    };

    const primaryIsLike = !likedByCurrentUser;
    try {
      if (primaryIsLike) {
        await doLike();
      } else {
        await doUnlike();
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        // Fallback to opposite action on 403
        try {
          if (primaryIsLike) {
            await doUnlike();
          } else {
            await doLike();
          }
        } catch (err2: any) {
          const errorMsg = err2?.response?.data?.message || err2?.message || t('alerts.failedToToggleLike');
          Alert.alert(t('common.error'), errorMsg);
        }
      } else {
        const errorMsg = error?.response?.data?.message || error?.message || t('alerts.failedToToggleLike');
        Alert.alert(t('common.error'), errorMsg);
      }
    }
  };

  const handleToggleSave = async () => {
    if (feed.type !== 'RECIPE' || !feed.recipe?.id) {
      return;
    }

    const doSave = async () => {
      await recipeService.saveRecipe(feed.recipe.id);
      setSavedByCurrentUser(true);
      bumpSave();
    };

    const doUnsave = async () => {
      await recipeService.unsaveRecipe(feed.recipe.id);
      setSavedByCurrentUser(false);
    };

    const primaryIsSave = !savedByCurrentUser;
    try {
      if (primaryIsSave) {
        await doSave();
      } else {
        await doUnsave();
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        // Fallback to opposite action on 403
        try {
          if (primaryIsSave) {
            await doUnsave();
          } else {
            await doSave();
          }
        } catch (err2: any) {
          const errorMsg = err2?.response?.data?.message || err2?.message || t('alerts.failedToToggleSave');
          Alert.alert(t('common.error'), errorMsg);
        }
      } else {
        const errorMsg = error?.response?.data?.message || error?.message || t('alerts.failedToToggleSave');
        Alert.alert(t('common.error'), errorMsg);
      }
    }
  };

  const handleShowComments = async () => {
    setCommentsVisible(true);
    setCommentsLoading(true);
    try {
      const data = await feedService.getFeedComments(feed.id);
      setComments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || t('alerts.failedToFetchComments');
      Alert.alert(t('common.error'), errorMsg);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    const trimmed = commentMessage.trim();
    if (!trimmed || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      await feedService.commentFeed(feed.id, trimmed);
      setCommentMessage('');
      setCommentCount((c) => c + 1);
      // Refresh comments to include the new one
      const data = await feedService.getFeedComments(feed.id);
      setComments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || t('alerts.failedToComment');
      Alert.alert(t('common.error'), errorMsg);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatDateTime = (value: any) => {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const lang = i18n.language || 'en';
        let locale = 'en-US';
        if (lang.startsWith('tr')) locale = 'tr-TR';
        else if (lang.startsWith('ja')) locale = 'ja-JP';
        return date.toLocaleString(locale);
      }
    } catch {}
    return String(value ?? '');
  };

  const handleRecipePress = () => {
    if (feed.type === 'RECIPE' && feed.recipe?.id) {
      router.push({ 
        pathname: '/recipeDetail/recipeDetail', 
        params: { recipeId: String(feed.recipe.id) } 
      });
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: colors.gray[200] }]}>
      <View style={styles.header}>
        {feed.profilePhoto ? (
          <Image source={{ uri: feed.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.gray[200], borderColor: colors.gray[300] }]} />
        )}
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{fullName}</Text>
          {!!created && <Text style={[styles.time, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>{created}</Text>}
        </View>
      </View>

      {feed.type === 'RECIPE' ? (
        <TouchableOpacity activeOpacity={0.7} onPress={handleRecipePress}>
          {!!feed.text && (
            <Text style={[styles.text, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>
              {translatingText ? t('recipes.translating') : (translatedText ?? feed.text)}
            </Text>
          )}
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : null}
        </TouchableOpacity>
      ) : (
        <>
          {!!feed.text && (
            <Text style={[styles.text, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>
              {translatingText ? t('recipes.translating') : (translatedText ?? feed.text)}
            </Text>
          )}
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : null}
        </>
      )}

      <View style={styles.footer}>
        {feed.type === 'RECIPE' && (
          <TouchableOpacity activeOpacity={0.7} onPress={handleToggleSave} style={styles.actionContainer}>
            <Animated.View style={{ transform: [{ scale: saveScale }] }}>
              <Ionicons 
                name={savedByCurrentUser ? 'bookmark' : 'bookmark-outline'} 
                size={18} 
                color={savedByCurrentUser ? colors.primary : textColors.secondary} 
              />
            </Animated.View>
          </TouchableOpacity>
        )}
        <TouchableOpacity activeOpacity={0.7} onPress={handleToggleLike} style={styles.actionContainer}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Ionicons
              name={likedByCurrentUser ? 'heart' : 'heart-outline'}
              size={18}
              color={colors.error}
            />
          </Animated.View>
          <Text style={[styles.meta, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>{likeCount} {t('feed.likes')}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={handleShowComments} style={styles.actionContainer}>
          <Ionicons name="chatbubble-outline" size={18} color={textColors.secondary} />
          <Text style={[styles.meta, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>{commentCount} {t('feed.commentsCount')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={commentsVisible}
        onBackdropPress={() => setCommentsVisible(false)}
        onBackButtonPress={() => setCommentsVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
        avoidKeyboard
        propagateSwipe
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('feed.comments')}</Text>
            <TouchableOpacity onPress={() => setCommentsVisible(false)}>
              <Ionicons name="close" size={20} color={textColors.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {commentsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>{t('feed.loadingComments')}</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={textColors.secondary} />
                <Text style={styles.emptyText}>{t('feed.noComments')}</Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item: any, index: number) => String(item?.id ?? index)}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item, index }: { item: any; index: number }) => {
                  const translatedComment = translatedComments[index] || item;
                  return (
                    <View style={styles.commentRow}>
                      {item?.profilePhoto ? (
                        <Image source={{ uri: item.profilePhoto }} style={styles.commentAvatar} />
                      ) : (
                        <View style={[styles.commentAvatar, styles.commentAvatarFallback]} />
                      )}
                      <View style={styles.commentBody}>
                        <View style={styles.commentHeaderRow}>
                          <Text style={styles.commentName} numberOfLines={1}>
                            {[item?.name, item?.surname].filter(Boolean).join(' ') || 'User'}
                          </Text>
                          {!!item?.createdAt && (
                            <Text style={styles.commentTime}>{formatDateTime(item.createdAt)}</Text>
                          )}
                        </View>
                        {!!translatedComment?.message && (
                          <Text style={styles.commentMessage}>{String(translatedComment.message)}</Text>
                        )}
                      </View>
                    </View>
                  );
                }}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 8 }}
                style={styles.commentsList}
              />
            )}
          </View>

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentTextInput}
              placeholder={t('feed.writeComment')}
              placeholderTextColor={textColors.secondary}
              value={commentMessage}
              onChangeText={setCommentMessage}
              editable={!commentSubmitting}
              returnKeyType="send"
              onSubmitEditing={handleSubmitComment}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!commentMessage.trim() || commentSubmitting) && styles.sendButtonDisabled]}
              onPress={handleSubmitComment}
              activeOpacity={0.7}
              disabled={!commentMessage.trim() || commentSubmitting}
            >
              {commentSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="paper-plane-outline" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  text: {
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontSize: 12,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    maxHeight: 520,
    minHeight: 260,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalBody: {
    flexGrow: 1,
    marginBottom: 8,
  },
  commentsList: {
    maxHeight: 380,
  },
  modalTitle: {
    color: textColors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  loadingText: {
    color: textColors.secondary,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyText: {
    color: textColors.secondary,
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 8,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
  },
  commentAvatarFallback: {
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  commentBody: {
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentName: {
    color: textColors.primary,
    fontWeight: '600',
    maxWidth: '70%',
  },
  commentTime: {
    color: textColors.secondary,
    fontSize: 11,
  },
  commentMessage: {
    color: textColors.primary,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: textColors.primary,
    backgroundColor: colors.white,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
});

export default FeedCard;



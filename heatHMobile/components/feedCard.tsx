import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

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
  const fullName = [feed.name, feed.surname].filter(Boolean).join(' ') || 'User';
  const created = feed.createdAt ? new Date(feed.createdAt).toLocaleString() : '';
  const imageUri =
    feed.type === 'RECIPE' ? feed?.recipe?.photo ?? null :
    feed.type === 'IMAGE_AND_TEXT' ? feed?.image ?? null :
    null;

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

      {!!feed.text && <Text style={[styles.text, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{feed.text}</Text>}

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.image, { backgroundColor: colors.background }]} resizeMode="cover" />
      ) : null}

      <View style={styles.footer}>
        <Text style={[styles.meta, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>
          <Text style={{ fontSize: 14 }}>❤️</Text> {feed.likeCount ?? 0}
        </Text>
        <Text style={[styles.meta, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>
          <Text style={{ fontSize: 14 }}>💬</Text> {feed.commentCount ?? 0}
        </Text>
        <Text style={[styles.meta, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>#{feed.type}</Text>
      </View>
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
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
  },
});

export default FeedCard;



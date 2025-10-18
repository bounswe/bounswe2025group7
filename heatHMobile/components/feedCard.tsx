import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, textColors } from '@/constants/theme';

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
  const fullName = [feed.name, feed.surname].filter(Boolean).join(' ') || 'User';
  const created = feed.createdAt ? new Date(feed.createdAt).toLocaleString() : '';
  const imageUri =
    feed.type === 'RECIPE' ? feed?.recipe?.photo ?? null :
    feed.type === 'IMAGE_AND_TEXT' ? feed?.image ?? null :
    null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {feed.profilePhoto ? (
          <Image source={{ uri: feed.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{fullName}</Text>
          {!!created && <Text style={styles.time}>{created}</Text>}
        </View>
      </View>

      {!!feed.text && <Text style={styles.text}>{feed.text}</Text>}

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.meta}>❤️ {feed.likeCount ?? 0}</Text>
        <Text style={styles.meta}>💬 {feed.commentCount ?? 0}</Text>
        <Text style={styles.meta}>#{feed.type}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.gray[200],
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
    backgroundColor: colors.gray[200],
  },
  avatarFallback: {
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    color: textColors.primary,
    fontWeight: '600',
  },
  time: {
    color: textColors.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  text: {
    color: textColors.primary,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.background,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: textColors.secondary,
    fontSize: 12,
  },
});

export default FeedCard;



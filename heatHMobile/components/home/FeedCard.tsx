import { useMemo, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Avatar from '@/components/user/Avatar';
import Button from '@/components/ui/Button';
import { FeedResponse, feedService } from '@/services/feedService';

export default function FeedCard({ feed }: { feed: FeedResponse }) {
  const [liked, setLiked] = useState<boolean>(feed.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState<number>(feed.likeCount);

  const handleToggleLike = async () => {
    try {
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));
      if (nextLiked) {
        await feedService.likeFeed(feed.id);
      } else {
        await feedService.unlikeFeed(feed.id);
      }
    } catch (e) {
      setLiked(feed.likedByCurrentUser);
      setLikeCount(feed.likeCount);
    }
  };

  const headerName = useMemo(() => {
    const name = [feed.name, feed.surname].filter(Boolean).join(' ').trim();
    return name.length > 0 ? name : 'User';
  }, [feed.name, feed.surname]);

  return (
    <ThemedView style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Avatar uri={feed.profilePhoto} size={40} />
        <View style={{ marginLeft: 10 }}>
          <ThemedText style={{ fontWeight: '600' }}>{headerName}</ThemedText>
          <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>{new Date(feed.createdAt).toLocaleString()}</ThemedText>
        </View>
      </View>

      {feed.text ? <ThemedText style={{ marginBottom: 8 }}>{feed.text}</ThemedText> : null}

      {feed.image ? (
        <Image source={{ uri: feed.image }} style={{ width: '100%', height: 220, borderRadius: 10, backgroundColor: '#f3f4f6' }} />
      ) : null}

      {feed.type === 'RECIPE' && feed.recipe ? (
        <View style={{ marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: '#f9fafb' }}>
          <ThemedText style={{ fontWeight: '600', marginBottom: 4 }}>{feed.recipe.title || 'Recipe'}</ThemedText>
          {feed.recipe.photo ? (
            <Image source={{ uri: feed.recipe.photo }} style={{ width: '100%', height: 180, borderRadius: 8, backgroundColor: '#f3f4f6' }} />
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-between' }}>
        <Pressable onPress={handleToggleLike} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: liked ? '#0a7ea4' : '#e5e7eb' }}>
          <Text style={{ color: liked ? '#ffffff' : '#111827' }}>{liked ? 'Liked' : 'Like'} · {likeCount}</Text>
        </Pressable>
        <ThemedText style={{ opacity: 0.7 }}>Comments · {feed.commentCount}</ThemedText>
      </View>
    </ThemedView>
  );
}



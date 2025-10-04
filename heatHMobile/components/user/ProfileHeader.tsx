import React from 'react';
import { StyleSheet } from 'react-native';
import Avatar from './Avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { User } from '@/models/User';

interface ProfileHeaderProps {
  user: User;
  showStats?: boolean;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
}

export default function ProfileHeader({ 
  user, 
  showStats = false, 
  postCount = 0, 
  followerCount = 0, 
  followingCount = 0 
}: ProfileHeaderProps) {
  return (
    <ThemedView style={styles.container}>
      <Avatar uri={user.profilePhoto} size={80} />
      <ThemedText style={styles.username}>{user.username}</ThemedText>
      {(user.name || user.surname) && (
        <ThemedText style={styles.displayName}>
          {user.name} {user.surname}
        </ThemedText>
      )}
      
      {showStats && (
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{postCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Posts</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{followerCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Followers</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{followingCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Following</ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  displayName: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});



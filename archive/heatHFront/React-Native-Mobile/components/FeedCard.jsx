import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const FeedCard = ({ feed }) => {
  // Use recipe photo as fallback if feed.image is null
  const imageUrl = feed.image || feed.recipe?.photo;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: feed.profilePhoto }} style={styles.avatar} />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{feed.name} {feed.surname}</Text>
          {/* Wrapping the timestamp in <Text> */}
          <Text style={styles.timestamp}>{feed.createdAt}</Text>
        </View>
      </View>

      {/* Wrapping the text in <Text> */}
      <Text style={styles.text}>{feed.text}</Text>

      {/* Conditionally rendering the image or recipe photo */}
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.feedImage} />}
      
      {/* Rendering the recipe only if it exists */}
      {feed.recipe && (
        <View style={styles.recipeContainer}>
          <Text style={styles.recipeTitle}>🍽 {feed.recipe.title}</Text>
          <Text style={styles.savedText}>{feed.savedByCurrentUser ? 'Saved' : 'Not Saved'}</Text>
        </View>
      )}

      {/* Rendering the footer with likes and comments */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>❤️ {feed.likeCount} | 💬 {feed.commentCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,  // For Android shadow
    overflow: 'hidden', // To ensure rounded corners for images
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',  // Light border around avatar
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  text: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedImage: {
    width: '100%',
    height: 250,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recipeContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    marginBottom: 12,
  },
  recipeTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  savedText: {
    fontSize: 12,
    color: '#777',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
});

export default FeedCard;

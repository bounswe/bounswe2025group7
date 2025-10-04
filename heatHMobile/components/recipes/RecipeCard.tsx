import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipeModel } from '@/models/Recipe';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const cardWidth = isTablet ? (width - 60) / 3 : (width - 36) / 2; // Responsive columns

interface RecipeCardProps {
  recipe: RecipeModel;
  onPress: (recipe: RecipeModel) => void;
  onSave?: (recipeId: string) => void;
  onShare?: (recipe: RecipeModel) => void;
  showSaveButton?: boolean;
  showShareButton?: boolean;
}

export default function RecipeCard({ 
  recipe, 
  onPress, 
  onSave, 
  onShare, 
  showSaveButton = true,
  showShareButton = true 
}: RecipeCardProps) {
  return (
    <View style={styles.card}>
      {/* Title at the top */}
      <Text style={styles.title} numberOfLines={2}>
        {recipe.getTitle()}
      </Text>
      
      {/* Image below title */}
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={() => onPress(recipe)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: recipe.getPhoto() }} 
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      {/* Action buttons at the bottom */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onPress(recipe)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        {showSaveButton && onSave && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onSave(recipe.getId())}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="bookmark" size={12} color="#169873" />
            <Text style={styles.actionText}>Remove</Text>
          </TouchableOpacity>
        )}
        
        {showShareButton && onShare && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onShare(recipe)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-outline" size={12} color="#169873" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    margin: 16,
    marginBottom: 8,
    height: 40,
    lineHeight: 20,
    textAlign: 'left',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '75%', // 4:3 aspect ratio like frontend
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
    minHeight: 28,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  actionText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
    fontWeight: '500',
  },
});



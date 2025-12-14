import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
  style?: ViewStyle;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readOnly = false,
  size = 24,
  style,
}) => {
  const { colors } = useThemeColors();
  const stars = [1, 2, 3, 4, 5];

  const handlePress = (starValue: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const getIconName = (starValue: number) => {
    if (rating >= starValue) {
      return 'star';
    } else if (rating >= starValue - 0.5) {
      return 'star-half';
    } else {
      return 'star-outline';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {stars.map((starValue) => (
        <TouchableOpacity
          key={starValue}
          onPress={() => handlePress(starValue)}
          disabled={readOnly}
          activeOpacity={0.7}
        >
          <Ionicons
            name={getIconName(starValue)}
            size={size}
            color={colors.primary}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default StarRating;


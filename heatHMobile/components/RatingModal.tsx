import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../hooks/useThemeColors';
import StarRating from './StarRating';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  initialRating?: number;
  title?: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialRating = 0,
  title,
}) => {
  const { t } = useTranslation();
  const { colors, textColors, fonts } = useThemeColors();
  const [currentRating, setCurrentRating] = useState(initialRating);

  // Reset rating when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentRating(initialRating || 0);
    }
  }, [visible, initialRating]);

  const handleSubmit = () => {
    onSubmit(currentRating);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.white }]}>
          <Text style={[styles.title, { color: textColors.primary, fontFamily: fonts.bold }]}>
            {title || t('recipes.rateEasiness')}
          </Text>
          
          <View style={styles.ratingContainer}>
            <StarRating
              rating={currentRating}
              onRatingChange={setCurrentRating}
              size={40}
              style={styles.starRating}
            />
            <Text style={[styles.ratingText, { color: textColors.secondary, fontFamily: fonts.medium }]}>
              {currentRating > 0 ? `${currentRating}/5` : t('recipes.tapToRate')}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.gray[300] }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: textColors.secondary, fontFamily: fonts.medium }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.submitButton, 
                { backgroundColor: colors.primary, opacity: currentRating === 0 ? 0.5 : 1 }
              ]}
              onPress={handleSubmit}
              disabled={currentRating === 0}
            >
              <Text style={[styles.buttonText, { color: colors.white, fontFamily: fonts.bold }]}>
                {t('common.submit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  starRating: {
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  submitButton: {
    // Background color set via props
  },
  buttonText: {
    fontSize: 16,
  },
});

export default RatingModal;

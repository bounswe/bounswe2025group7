import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Share,
  Linking
} from 'react-native';
import { colors, textColors } from '../constants/theme';

interface ShareableItem {
  id?: number;
  recipeId?: number;
  title: string;
  photo: string;
}

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  item: ShareableItem | null;
  baseUrl?: string; // Optional base URL for sharing, defaults to 'https://heath.app'
}

export default function ShareModal({ 
  visible, 
  onClose, 
  item, 
  baseUrl = 'https://heath.app' 
}: ShareModalProps) {
  if (!item) return null;

  // Get the item ID (either id or recipeId)
  const getItemId = () => {
    return item.id || item.recipeId || 0;
  };

  // Share via native share sheet
  const shareViaNative = async () => {
    try {
      const shareUrl = `${baseUrl}/recipe/${getItemId()}`;
      const shareMessage = `Check out this amazing recipe: ${item.title}\n\n${shareUrl}`;
      
      const result = await Share.share({
        message: shareMessage,
        title: item.title,
        url: shareUrl,
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Recipe shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share recipe. Please try again.');
    } finally {
      onClose();
    }
  };

  // Share via Facebook
  const shareViaFacebook = async () => {
    try {
      const shareUrl = `${baseUrl}/recipe/${getItemId()}`;
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      
      const supported = await Linking.canOpenURL(facebookUrl);
      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        Alert.alert('Error', 'Facebook app is not installed on this device.');
      }
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      Alert.alert('Error', 'Failed to share to Facebook. Please try again.');
    } finally {
      onClose();
    }
  };

  // Share via WhatsApp
  const shareViaWhatsApp = async () => {
    try {
      const shareUrl = `${baseUrl}/recipe/${getItemId()}`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(`Check out this amazing recipe: ${item.title}\n\n${shareUrl}`)}`;
      
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device.');
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      Alert.alert('Error', 'Failed to share to WhatsApp. Please try again.');
    } finally {
      onClose();
    }
  };

  // Share via Instagram
  const shareViaInstagram = async () => {
    try {
      const shareUrl = `${baseUrl}/recipe/${getItemId()}`;
      const instagramUrl = `instagram://story-camera`;
      
      const supported = await Linking.canOpenURL(instagramUrl);
      if (supported) {
        // Instagram doesn't support direct URL sharing, so we'll use native share
        await Share.share({
          message: `Check out this amazing recipe: ${item.title}\n\n${shareUrl}`,
          title: item.title,
        });
      } else {
        Alert.alert('Error', 'Instagram is not installed on this device.');
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      Alert.alert('Error', 'Failed to share to Instagram. Please try again.');
    } finally {
      onClose();
    }
  };

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      const shareUrl = `${baseUrl}/recipe/${getItemId()}`;
      await Share.share({
        message: shareUrl,
        title: 'Recipe Link',
      });
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link. Please try again.');
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.shareModal}>
          <View style={styles.shareModalHeader}>
            <Text style={styles.shareModalTitle}>Share Recipe</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recipePreview}>
            <Image source={{ uri: item.photo }} style={styles.previewImage} />
            <Text style={styles.previewTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          
          <View style={styles.shareOptions}>
            <TouchableOpacity style={styles.shareOption} onPress={shareViaNative}>
              <View style={[styles.shareIcon, { backgroundColor: colors.primary }]}>
                <Text style={styles.shareIconText}>📱</Text>
              </View>
              <Text style={styles.shareOptionText}>Share Link</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption} onPress={shareViaFacebook}>
              <View style={[styles.shareIcon, { backgroundColor: '#1877F2' }]}>
                <Text style={styles.shareIconText}>f</Text>
              </View>
              <Text style={styles.shareOptionText}>Facebook</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption} onPress={shareViaWhatsApp}>
              <View style={[styles.shareIcon, { backgroundColor: '#25D366' }]}>
                <Text style={styles.shareIconText}>W</Text>
              </View>
              <Text style={styles.shareOptionText}>WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption} onPress={shareViaInstagram}>
              <View style={[styles.shareIcon, { backgroundColor: '#E4405F' }]}>
                <Text style={styles.shareIconText}>📷</Text>
              </View>
              <Text style={styles.shareOptionText}>Instagram</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption} onPress={copyLink}>
              <View style={[styles.shareIcon, { backgroundColor: colors.gray[600] }]}>
                <Text style={styles.shareIconText}>📋</Text>
              </View>
              <Text style={styles.shareOptionText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: textColors.primary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: textColors.secondary,
    fontWeight: 'bold',
  },
  recipePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  previewTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: textColors.primary,
    lineHeight: 20,
  },
  shareOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shareOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  shareIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareIconText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  shareOptionText: {
    fontSize: 12,
    color: textColors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

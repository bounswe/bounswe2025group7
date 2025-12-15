import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput, Modal, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';
import { interestFormService } from '../../services/interestFormService';
import { feedService } from '../../services/feedService';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTheme } from '../../context/ThemeContext';
import { useMeasurement } from '../../context/MeasurementContext';
import { measurementSystemOptions } from '../../constants/measurements';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { translateTextContent, mapLanguageToRecipeTarget } from '../../services/translationService';

interface InterestFormData {
  name: string;
  surname: string;
  dateOfBirth: string;
  height: number;
  weight: number;
  gender: string;
  profilePhoto?: string;
}

interface FeedResponse {
  id: number;
  userId: number;
  type: 'TEXT' | 'IMAGE_AND_TEXT' | 'RECIPE';
  text: string;
  image: string;
  recipe: any;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  name: string;
  surname: string;
  profilePhoto: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, textColors, borderColors, fonts, lineHeights } = useThemeColors();
  const { isDark, toggleTheme, isDyslexic, toggleFont, isColorBlind, toggleColorBlind } = useTheme();
  const { system: measurementSystem, setSystem: setMeasurementSystem } = useMeasurement();
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'tr' | 'ja'>(() => {
    const lang = i18n.language || 'en';
    if (lang.startsWith('tr')) return 'tr';
    if (lang.startsWith('ja')) return 'ja';
    return 'en';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<InterestFormData>({
    name: '',
    surname: '',
    dateOfBirth: '',
    height: 0,
    weight: 0,
    gender: '',
    profilePhoto: '',
  });
  const [editData, setEditData] = useState<InterestFormData>({
    name: '',
    surname: '',
    dateOfBirth: '',
    height: 0,
    weight: 0,
    gender: '',
    profilePhoto: '',
  });
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isImageUpdated, setIsImageUpdated] = useState(false);
  const [userFeeds, setUserFeeds] = useState<FeedResponse[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(false);
  const [translatedFeeds, setTranslatedFeeds] = useState<Map<number, { text?: string; recipeTitle?: string; recipeDescription?: string }>>(new Map());

  const genderOptions = ['male', 'female', 'other'] as const;
  type GenderOption = typeof genderOptions[number];

  const normalizeGenderValue = (value?: string): GenderOption | '' => {
    if (!value) return '';
    const normalized = value.trim().toLowerCase();
    if (
      normalized === 'male' ||
      normalized === t('personalInfo.male').trim().toLowerCase()
    ) {
      return 'male';
    }
    if (
      normalized === 'female' ||
      normalized === t('personalInfo.female').trim().toLowerCase()
    ) {
      return 'female';
    }
    if (
      normalized === 'other' ||
      normalized === t('personalInfo.other').trim().toLowerCase()
    ) {
      return 'other';
    }
    return '';
  };

  const getGenderLabel = (value?: string) => {
    const normalized = normalizeGenderValue(value);
    if (!value && !normalized) {
      return t('common.notSet');
    }
    switch (normalized) {
      case 'male':
        return t('personalInfo.male');
      case 'female':
        return t('personalInfo.female');
      case 'other':
        return t('personalInfo.other');
      default:
        return value ?? t('common.notSet');
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  // Sync current language with i18n
  useEffect(() => {
    const lang = i18n.language || 'en';
    let langCode: 'en' | 'tr' | 'ja' = 'en';
    if (lang.startsWith('tr')) langCode = 'tr';
    else if (lang.startsWith('ja')) langCode = 'ja';
    setCurrentLanguage(langCode);
  }, [i18n.language]);

  // Translate user feeds when language or feeds change
  useEffect(() => {
    if (userFeeds.length === 0) {
      setTranslatedFeeds(new Map());
      return;
    }

    let cancelled = false;
    const translateFeeds = async () => {
      const targetLang = mapLanguageToRecipeTarget(i18n.language);
      const translations = new Map<number, { text?: string; recipeTitle?: string; recipeDescription?: string }>();

      await Promise.all(
        userFeeds.map(async (feed) => {
          try {
            const feedTranslations: { text?: string; recipeTitle?: string; recipeDescription?: string } = {};
            
            if (feed.text) {
              feedTranslations.text = await translateTextContent(feed.text, targetLang);
            }
            
            if (feed.type === 'RECIPE' && feed.recipe) {
              if (feed.recipe.title) {
                feedTranslations.recipeTitle = await translateTextContent(feed.recipe.title, targetLang);
              }
              if (feed.recipe.description) {
                feedTranslations.recipeDescription = await translateTextContent(feed.recipe.description, targetLang);
              }
            }
            
            if (!cancelled) {
              translations.set(feed.id, feedTranslations);
            }
          } catch (error) {
            // Ignore translation errors
          }
        })
      );

      if (!cancelled) {
        setTranslatedFeeds(translations);
      }
    };

    translateFeeds();
    return () => {
      cancelled = true;
    };
  }, [userFeeds, i18n.language]);

  // Handle language change
  const handleLanguageChange = async (lang: 'en' | 'tr' | 'ja') => {
    setCurrentLanguage(lang);
    await i18n.changeLanguage(lang);
  };

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is authenticated
      const token = await authService.getAccessToken();
      
      if (!token) {
        Alert.alert(t('alerts.authenticationRequired'), t('alerts.pleaseLogin'));
        router.replace('/auth/sign-in' as any);
        return;
      }
      await Promise.all([loadProfileData(), loadUserFeeds()]);
    } catch (error) {
      Alert.alert(t('alerts.authenticationError'), t('alerts.pleaseLoginAgain'));
      router.replace('/auth/sign-in' as any);
    }
  };

  const loadUserFeeds = async () => {
    try {
      setFeedsLoading(true);
      const feeds = await feedService.getFeedByUser();

      setUserFeeds(Array.isArray(feeds) ? feeds : []);
    } catch (error) {
      setUserFeeds([]);
    } finally {
      setFeedsLoading(false);
    }
  };

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await interestFormService.getInterestForm();
      
      setProfileData(data);
      setEditData(data);
      
      // Set profile image if it exists from backend
      const imageUri = createImageUri(data.profilePhoto);

      setProfileImageUri(imageUri);
      setIsImageUpdated(false); // Reset image update flag when loading
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert(t('alerts.authenticationError'), t('alerts.pleaseLoginAgain'));
        // Optionally redirect to login
        // router.replace('/auth/sign-in' as any);
      } else if (error.response?.status === 404) {
        // Profile doesn't exist yet, set default values
        const defaultData = {
          name: '',
          surname: '',
          dateOfBirth: '',
          height: 0,
          weight: 0,
          gender: '',
          profilePhoto: '',
        };
        setProfileData(defaultData);
        setEditData(defaultData);
        setProfileImageUri(null);
        setIsImageUpdated(false);
      } else {
        Alert.alert(t('common.error'), t('alerts.failedToLoad'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  // Corrected function in ProfileScreen.js

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Create a copy of the data to be sent
      const dataToSend = { ...editData };
      if (dataToSend.gender) {
        const normalizedGender = normalizeGenderValue(dataToSend.gender);
        if (normalizedGender) {
          dataToSend.gender = normalizedGender.charAt(0).toUpperCase() + normalizedGender.slice(1);
        }
      }
      
      // If the image was changed, process it
      if (isImageUpdated) {
        if (profileImageUri) {
          // Convert the new local image URI to a full Base64 data URI
          const base64Image = await convertImageToBase64(profileImageUri);
          dataToSend.profilePhoto = base64Image;
        } else {
          // If the image was removed, send an empty string
          dataToSend.profilePhoto = '';
        }
      } else {
        // If the image was NOT updated, remove the key so the backend doesn't change it
        delete dataToSend.profilePhoto;
      }
      
      // Check if this is a new profile or an update
      const isNewProfile = !profileData.name && !profileData.surname;
      
      if (isNewProfile) {
        await interestFormService.createInterestForm(dataToSend);
      } else {
        await interestFormService.updateInterestForm(dataToSend);
      }
      
      // Update the local state upon success
      setProfileData(dataToSend); // Use the successfully sent data
      setIsImageUpdated(false); 
      setIsEditing(false);
      setShowSuccessModal(true);

    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert(t('alerts.authenticationError'), t('alerts.sessionExpired'));
      } else if (error.response?.status === 400) {
        Alert.alert(t('alerts.validationError'), t('alerts.checkInput'));
      } else {
        Alert.alert(t('common.error'), t('alerts.failedToSave'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    // Reset image state to original backend photo
    setProfileImageUri(createImageUri(profileData.profilePhoto || null));
    setIsImageUpdated(false);
  };

  const handleGenderSelect = (gender: GenderOption) => {
    setEditData({ ...editData, gender });
    setShowGenderModal(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDateModal(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setEditData({ ...editData, dateOfBirth: formattedDate });
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return t('common.notSet');
    try {
      const date = new Date(dateString);
      const lang = i18n.language || 'en';
      // Map i18n language codes to locale codes
      let locale = 'en-US';
      if (lang.startsWith('tr')) locale = 'tr-TR';
      else if (lang.startsWith('ja')) locale = 'ja-JP';
      
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const openDatePicker = () => {
    if (editData.dateOfBirth) {
      setSelectedDate(new Date(editData.dateOfBirth));
    } else {
      setSelectedDate(new Date());
    }
    setShowDateModal(true);
  };

  // Corrected function in ProfileScreen.js

const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Return the entire result, which includes the "data:image/jpeg;base64," prefix
        resolve(reader.result as string); 
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
};

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('alerts.permissionRequired'), t('alerts.photoLibraryPermission'));
        return;
      }

      // Launch image picker
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setProfileImageUri(uri);
        setIsImageUpdated(true);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('alerts.failedToPickImage'));
    }
  };

  const removeImage = () => {
    setProfileImageUri(null);
    setIsImageUpdated(true);
    setEditData({ ...editData, profilePhoto: '' });
  };

  const createImageUri = (profilePhoto: string | null): string | null => {
    if (!profilePhoto) return null;
    
    // If it's already a data URI, return as is
    if (profilePhoto.startsWith('data:')) {
      return profilePhoto;
    }
    
    // If it's a URL (http/https), return as is
    if (profilePhoto.startsWith('http://') || profilePhoto.startsWith('https://')) {
      return profilePhoto;
    }
    
    // If it's base64 data, create data URI
    return `data:image/jpeg;base64,${profilePhoto}`;
  };

  const performLogout = async () => {
    try {
      await authService.logout();
      setTimeout(() => {
        router.replace('/auth/sign-in' as any);
      }, 100);
    } catch (error) {
      if (Platform.OS === 'web') {
        alert(t('alerts.failedToLogout'));
      } else {
        Alert.alert(t('common.error'), t('alerts.failedToLogout'));
      }
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Use native browser confirm for web
      if (confirm(t('profile.logoutConfirm'))) {
        await performLogout();
      }
    } else {
      // Use Alert.alert for native
      Alert.alert(
        t('profile.logout'),
        t('profile.logoutConfirm'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('profile.logout'),
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: textColors.secondary, fontFamily: fonts.regular }]}>{t('profile.loadingProfile')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.header, { borderBottomColor: borderColors.light }]}>
          <View>
            <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>{t('profile.title')}</Text>
            <Text style={[styles.fontModeIndicator, { color: textColors.secondary, fontFamily: fonts.regular }]}>
              {t('profile.fontMode', { mode: isDyslexic ? t('profile.dyslexicFont') : t('profile.normalFont') })}
            </Text>
            <Text style={[styles.colorBlindIndicator, { color: textColors.secondary, fontFamily: fonts.regular }]}>
              {t('profile.colorMode', { mode: isColorBlind ? t('profile.colorBlindMode') : t('profile.standardColors') })}
            </Text>
          </View>
          <View style={[styles.headerButtons, isDyslexic && styles.headerButtonsDyslexic]}>
            <TouchableOpacity style={styles.themeToggleButton} onPress={toggleTheme}>
              <Text style={[styles.themeToggleIcon, { fontSize: 20 }]}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fontToggleButton, isDyslexic && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} onPress={toggleFont}>
              <Text style={[styles.fontToggleIcon, { fontFamily: fonts.regular, color: isDyslexic ? colors.primary : textColors.primary, fontSize: 16 }]}>{isDyslexic ? '🔤' : '📝'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.colorBlindToggleButton, isColorBlind && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} onPress={toggleColorBlind}>
              <Text style={[styles.colorBlindToggleIcon, { fontFamily: fonts.regular, color: isColorBlind ? colors.primary : textColors.primary, fontSize: 16 }]}>{isColorBlind ? '👓' : '🎨'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <View style={[styles.profileImageWrapper, { borderColor: colors.primary }]}>
            {profileImageUri ? (
              <Image 
                source={{ uri: profileImageUri }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.gray[100] }]}>
                <Text style={[styles.placeholderText, { color: colors.gray[400], fontSize: 24 }]}>📷</Text>
              </View>
            )}
          </View>
          {isEditing && (
            <View style={styles.imageActions}>
              <TouchableOpacity style={[styles.imageActionButton, { backgroundColor: colors.primary }]} onPress={pickImage}>
                <Text style={[styles.imageActionText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('profile.changePhoto')}</Text>
              </TouchableOpacity>
              {profileImageUri && (
                <TouchableOpacity style={[styles.removeImageButton, { backgroundColor: colors.error }]} onPress={removeImage}>
                  <Text style={[styles.removeImageText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('common.remove')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('profile.name')}</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColors.primary, backgroundColor: colors.white, borderColor: borderColors.medium, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
              value={editData.name}
              onChangeText={(text) => setEditData({ ...editData, name: text })}
              placeholder={t('personalInfo.enterName')}
              placeholderTextColor={textColors.hint}
            />
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.name || t('common.notSet')}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('profile.surname')}</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColors.primary, backgroundColor: colors.white, borderColor: borderColors.medium, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
              value={editData.surname}
              onChangeText={(text) => setEditData({ ...editData, surname: text })}
              placeholder={t('personalInfo.enterSurname')}
              placeholderTextColor={textColors.hint}
            />
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.surname || t('common.notSet')}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium }]}>{t('profile.dateOfBirth')}</Text>
          {isEditing ? (
            <TouchableOpacity style={[styles.dateSelector, { backgroundColor: colors.white, borderColor: borderColors.medium }]} onPress={openDatePicker}>
              <Text style={[styles.dateSelectorText, { color: textColors.primary, fontFamily: fonts.regular }]}>
                {editData.dateOfBirth ? formatDisplayDate(editData.dateOfBirth) : t('profile.selectDateOfBirth')}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{formatDisplayDate(profileData.dateOfBirth)}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('profile.height')}</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColors.primary, backgroundColor: colors.white, borderColor: borderColors.medium, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
              value={editData.height.toString()}
              onChangeText={(text) => setEditData({ ...editData, height: parseInt(text) || 0 })}
              placeholder="Enter height in cm"
              placeholderTextColor={textColors.hint}
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.height ? `${profileData.height} cm` : t('common.notSet')}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('profile.weight')}</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColors.primary, backgroundColor: colors.white, borderColor: borderColors.medium, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
              value={editData.weight.toString()}
              onChangeText={(text) => setEditData({ ...editData, weight: parseInt(text) || 0 })}
              placeholder="Enter weight in kg"
              placeholderTextColor={textColors.hint}
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.weight ? `${profileData.weight} kg` : t('common.notSet')}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
            <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium }]}>{t('profile.gender')}</Text>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.genderSelector, { backgroundColor: colors.white, borderColor: borderColors.medium }]}
              onPress={() => setShowGenderModal(true)}
            >
                <Text style={[styles.genderSelectorText, { color: textColors.primary, fontFamily: fonts.regular }]}>
                {editData.gender ? getGenderLabel(editData.gender) : t('profile.selectGender')}
              </Text>
              <Text style={[styles.dropdownArrow, { color: textColors.secondary, fontFamily: fonts.regular }]}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{getGenderLabel(profileData.gender)}</Text>
          )}
        </View>

        {/* Language Selection */}
        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('profile.language')}</Text>
          <View style={styles.languageSelector}>
            {(['en', 'tr', 'ja'] as const).map((lang) => {
              const isActive = currentLanguage === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  onPress={() => handleLanguageChange(lang)}
                  style={[
                    styles.languageOption,
                    {
                      backgroundColor: isActive ? colors.primary : colors.white,
                      borderColor: isActive ? colors.primary : borderColors.medium,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      {
                        color: isActive ? colors.primaryContrast : textColors.primary,
                        fontFamily: fonts.regular,
                        lineHeight: lineHeights.base,
                      },
                    ]}
                  >
                    {t(`common.${lang === 'en' ? 'english' : lang === 'tr' ? 'turkish' : 'japanese'}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('profile.measurementSystem')}</Text>
          <View style={styles.measurementSelector}>
            {measurementSystemOptions.map((option) => {
              const isActive = measurementSystem === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setMeasurementSystem(option)}
                  style={[
                    styles.measurementOption,
                    {
                      backgroundColor: isActive ? colors.primary : colors.white,
                      borderColor: isActive ? colors.primary : borderColors.medium,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.measurementOptionText,
                      {
                        color: isActive ? colors.primaryContrast : textColors.primary,
                        fontFamily: fonts.regular,
                        lineHeight: lineHeights.base,
                      },
                    ]}
                  >
                    {option === 'metric' ? t('profile.metricSystem') : t('profile.imperialSystem')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base, textAlign: 'center' }]}>{t('profile.saveChanges')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.white, borderColor: borderColors.medium }]} onPress={handleCancel}>
              <Text style={[styles.cancelButtonText, { color: textColors.secondary, fontFamily: fonts.medium }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Feeds Section */}
        <View style={[styles.feedsSection, { borderTopColor: borderColors.light }]}>
          <Text style={[styles.feedsSectionTitle, { color: colors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>{t('profile.myPosts')}</Text>
          {feedsLoading ? (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.loadingText, { color: textColors.secondary, fontFamily: fonts.regular }]}>{t('profile.loadingPosts')}</Text>
            </View>
          ) : userFeeds.length > 0 ? (
            userFeeds.map((feed, index) => {
              const handleFeedPress = () => {
                if (feed.type === 'RECIPE' && feed.recipe?.id) {
                  router.push(`/recipeDetail/recipeDetail?recipeId=${feed.recipe.id}` as any);
                }
              };

              const FeedContent = () => (
                <View style={[styles.feedCard, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
                  <View style={styles.feedHeader}>
                    <Text style={[styles.feedDate, { color: textColors.secondary, fontFamily: fonts.regular }]}>
                      {feed.createdAt ? new Date(feed.createdAt).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  
                  {feed.text && (
                    <Text style={[styles.feedContent, { color: textColors.primary, fontFamily: fonts.regular }]} numberOfLines={3}>
                      {translatedFeeds.get(feed.id)?.text ?? feed.text}
                    </Text>
                  )}
                  
                  {feed.type === 'RECIPE' && feed.recipe?.photo ? (
                    <Image source={{ uri: feed.recipe.photo }} style={[styles.feedImage, { backgroundColor: colors.gray[100] }]} />
                  ) : feed.image && (
                    <Image source={{ uri: feed.image }} style={[styles.feedImage, { backgroundColor: colors.gray[100] }]} />
                  )}
                  
                  {feed.type === 'RECIPE' && feed.recipe && (
                    <View style={[styles.recipeContainer, { borderColor: borderColors.light }]}>
                      <Text style={[styles.recipeTitle, { color: textColors.secondary, fontFamily: fonts.medium }]}>{t('recipes.recipe')}</Text>
                      <Text style={[styles.recipeName, { color: textColors.primary, fontFamily: fonts.medium }]}>
                        {translatedFeeds.get(feed.id)?.recipeTitle ?? feed.recipe.title ?? t('recipes.untitledRecipe')}
                      </Text>
                      {feed.recipe.description && (
                        <Text style={[styles.recipeDescription, { color: textColors.secondary, fontFamily: fonts.regular }]} numberOfLines={2}>
                          {translatedFeeds.get(feed.id)?.recipeDescription ?? feed.recipe.description}
                        </Text>
                      )}
                    </View>
                  )}
                  
                  <View style={[styles.feedStats, { borderTopColor: borderColors.light }]}>
                    <Text style={[styles.feedStat, { color: textColors.secondary, fontFamily: fonts.regular }, feed.likedByCurrentUser && { color: colors.error }]}>
                      {feed.likedByCurrentUser ? '❤️' : '🤍'} {feed.likeCount || 0} {t('feed.likes')}
                    </Text>
                    <Text style={[styles.feedStat, { color: textColors.secondary, fontFamily: fonts.regular }]}>
                      💬 {feed.commentCount || 0} {t('feed.commentsCount')}
                    </Text>
                  </View>
                </View>
              );

              return feed.type === 'RECIPE' ? (
                <TouchableOpacity 
                  key={feed.id || index} 
                  onPress={handleFeedPress}
                  style={styles.clickableFeedCard}
                  activeOpacity={0.7}
                >
                  <FeedContent />
                </TouchableOpacity>
              ) : (
                <View key={feed.id || index}>
                  <FeedContent />
                </View>
              );
            })
          ) : (
            <View style={styles.emptyFeedsContainer}>
              <Text style={[styles.emptyFeedsText, { color: textColors.secondary, fontFamily: fonts.regular }]}>{t('profile.noPosts')}</Text>
              <Text style={[styles.emptyFeedsSubtext, { color: textColors.hint, fontFamily: fonts.regular }]}>{t('profile.startSharing')}</Text>
            </View>
          )}
        </View>

        {/* Font Test Section */}
        <View style={[styles.fontTestSection, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.fontTestTitle, { color: textColors.primary, fontFamily: fonts.bold }]}>{t('profile.fontPreview')}</Text>
          <Text style={[styles.fontTestText, { color: textColors.secondary, fontFamily: fonts.regular }]}>
            {t('profile.fontPreviewText', { mode: isDyslexic ? t('profile.fontPreviewDyslexic') : t('profile.fontPreviewNormal') })}
          </Text>
        </View>

        {/* Color Blind Demonstration Section */}
        <View style={[styles.colorDemoSection, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.colorDemoTitle, { color: textColors.primary, fontFamily: fonts.bold }]}>{t('profile.colorDemonstration')}</Text>
          <View style={styles.colorDemoGrid}>
            <View style={[styles.colorDemoItem, { backgroundColor: colors.success }]}>
              <Text style={[styles.colorDemoLabel, { color: colors.white, fontFamily: fonts.medium }]}>{t('profile.colorSuccess')}</Text>
            </View>
            <View style={[styles.colorDemoItem, { backgroundColor: colors.error }]}>
              <Text style={[styles.colorDemoLabel, { color: colors.white, fontFamily: fonts.medium }]}>{t('profile.colorError')}</Text>
            </View>
            <View style={[styles.colorDemoItem, { backgroundColor: colors.warning }]}>
              <Text style={[styles.colorDemoLabel, { color: colors.white, fontFamily: fonts.medium }]}>{t('profile.colorWarning')}</Text>
            </View>
            <View style={[styles.colorDemoItem, { backgroundColor: colors.primary }]}>
              <Text style={[styles.colorDemoLabel, { color: colors.white, fontFamily: fonts.medium }]}>{t('profile.colorPrimary')}</Text>
            </View>
          </View>
          <Text style={[styles.colorDemoText, { color: textColors.secondary, fontFamily: fonts.regular }]}>
            {isColorBlind ? t('profile.colorBlindActive') : t('profile.colorStandardActive')}
          </Text>
        </View>

        {/* Action Buttons at Bottom */}
        <View style={styles.bottomActions}>
          {!isEditing && (
            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.secondary }]} onPress={handleEdit}>
              <Text style={[styles.editButtonText, { color: colors.white, fontFamily: fonts.medium }]}>{t('profile.editProfile')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
            <Text style={[styles.logoutButtonText, { color: colors.white, fontFamily: fonts.medium }]}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <Text style={[styles.modalTitle, { color: textColors.primary, fontFamily: fonts.bold }]}>{t('profile.selectGender')}</Text>
            {genderOptions.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  { borderColor: borderColors.light },
                  normalizeGenderValue(editData.gender) === gender && [styles.selectedGenderOption, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
                onPress={() => handleGenderSelect(gender)}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base },
                    normalizeGenderValue(editData.gender) === gender && [styles.selectedGenderOptionText, { color: colors.white }]
                  ]}
                >
                  {getGenderLabel(gender)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelModalButton, { borderColor: borderColors.medium }]}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={[styles.cancelModalButtonText, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.datePickerModal, { backgroundColor: colors.white }]}>
            <View style={[styles.datePickerHeader, { borderBottomColor: borderColors.light }]}>
              <Text style={[styles.datePickerTitle, { color: textColors.primary, fontFamily: fonts.bold }]}>{t('profile.selectDateOfBirth')}</Text>
              <TouchableOpacity
                style={[styles.datePickerCloseButton, { backgroundColor: colors.gray[100] }]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={[styles.datePickerCloseText, { color: textColors.secondary, fontFamily: fonts.regular }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              style={styles.datePickerComponent}
            />
            {Platform.OS === 'ios' && (
              <View style={[styles.datePickerActions, { borderTopColor: borderColors.light }]}>
                <TouchableOpacity
                  style={[styles.datePickerCancelButton, { borderColor: borderColors.medium }]}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={[styles.datePickerCancelText, { color: textColors.secondary, fontFamily: fonts.medium }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.datePickerConfirmButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={[styles.datePickerConfirmText, { color: colors.white }]}>{t('common.confirm')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: colors.white }]}>
            <Text style={[styles.successIcon, { color: colors.success }]}>✓</Text>
            <Text style={[styles.successTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>{t('common.success')}!</Text>
            <Text style={[styles.successMessage, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>
              {t('profile.profileSaved')}
            </Text>
            <TouchableOpacity 
              style={[styles.successButton, { backgroundColor: colors.primary }]} 
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={[styles.successButtonText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base, textAlign: 'center' }]}>
                {t('common.ok')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: -20,
    marginTop: -40,
  },
  headerButtonsDyslexic: {
    marginLeft: -80, // Move further left for dyslexic version
    marginTop: -65,  // Move upward for dyslexic version
  },
  themeToggleButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  themeToggleIcon: {
    fontSize: 20,
  },
  fontToggleButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fontToggleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorBlindToggleButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  colorBlindToggleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    minHeight: 40,
    paddingVertical: 4,
  },
  fontModeIndicator: {
    fontSize: 12,
    marginTop: 4,
    minHeight: 20,
    paddingVertical: 2,
  },
  colorBlindIndicator: {
    fontSize: 12,
    marginTop: 2,
    minHeight: 20,
    paddingVertical: 2,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    minHeight: 24,
    paddingVertical: 4,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeImageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    minHeight: 28,
    paddingVertical: 6,
  },
  value: {
    fontSize: 16,
    minHeight: 32,
    paddingVertical: 6,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 18,
    marginTop: 4,
    minHeight: 60,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 18,
    marginTop: 4,
    minHeight: 60,
  },
  dateSelectorText: {
    fontSize: 16,
    flex: 1,
  },
  calendarIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  genderSelectorText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  languageOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  measurementSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  measurementOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  measurementOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  datePickerModal: {
    borderRadius: 16,
    width: '90%',
    maxWidth: 350,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerComponent: {
    paddingHorizontal: 20,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedGenderOption: {
    // Dynamic styling applied in component
  },
  genderOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedGenderOptionText: {
    fontWeight: '600',
  },
  cancelModalButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelModalButtonText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    minHeight: 24,
    paddingVertical: 4,
    textAlign: 'center',
  },
  feedsSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  feedsSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    minHeight: 36,
    paddingVertical: 6,
  },
  feedCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clickableFeedCard: {
    marginBottom: 12,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  feedDate: {
    fontSize: 12,
  },
  feedContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  feedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  feedStat: {
    fontSize: 12,
  },
  likedStat: {
    // Dynamic styling applied in component
  },
  recipeContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  recipeTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyFeedsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyFeedsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyFeedsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  fontTestSection: {
    margin: 20,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 90,
  },
  fontTestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    minHeight: 28,
    paddingVertical: 4,
  },
  fontTestText: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 44,
    paddingVertical: 6,
  },
  colorDemoSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 120,
  },
  colorDemoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    minHeight: 24,
    paddingVertical: 2,
  },
  colorDemoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  colorDemoItem: {
    flex: 1,
    minWidth: 70,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDemoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorDemoText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  successModalContent: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


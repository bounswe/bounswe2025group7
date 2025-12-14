import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../hooks/useThemeColors';
import { recipeService } from '../../services/recipeService';
import ShareModal from '../../components/ShareModal';
import StarRating from '../../components/StarRating';
import RatingModal from '../../components/RatingModal';
import { useFocusEffect } from '@react-navigation/native';
import { translateRecipeContent, mapLanguageToRecipeTarget } from '../../services/translationService';
import { formatPrice } from '../../services/currencyService';
import { measurementOptionMap, MeasurementType, isMeasurementType } from '../../constants/measurements';

type Ingredient =
  | string
  | {
      name?: string;
      amount?: string | number;
      quantity?: number;
      type?: MeasurementType | string;
    };

type Recipe = {
  id?: number;
  title: string;
  description?: string;
  photo?: string;
  totalCalorie?: number;
  type?: string;
  price?: number;
  tag?: string;
  healthinessScore?: number;
  easinessScore?: number;
  ingredients?: Ingredient[];
  instructions?: string[];
  nutritionData?: Record<string, any>;
};

// Helper functions for nutrition formatting
const unitFor = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes('cal')) return 'kcal';
  if (k.includes('sodium') || k.includes('salt')) return 'mg';
  return 'g';
};
const formatNum = (n: number) => {
  const fixed = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return fixed.replace(/\.00$/, '');
};

const RecipeDetail = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, textColors, fonts, lineHeights } = useThemeColors();
  const { t, i18n } = useTranslation();
  const { recipeId, id } = useLocalSearchParams<{ recipeId?: string; id?: string }>();
  const effectiveId = (recipeId ?? id) as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState<Recipe | null>(null);
  const [averageEasinessScore, setAverageEasinessScore] = useState<number | null>(null);
  const [userEasinessRate, setUserEasinessRate] = useState<number | null>(null);
  const [easinessRatingLoading, setEasinessRatingLoading] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  // Get target language from global i18n setting
  const getMeasurementLabel = (value?: string | null, variant: 'long' | 'short' = 'long') => {
    if (value == null) return '';
    const raw = value.toString().trim();
    if (!raw) return '';
    const upper = raw.toUpperCase();
    if (isMeasurementType(upper)) {
      const config = measurementOptionMap[upper as MeasurementType];
      const key = variant === 'short' ? config.shortKey : config.labelKey;
      return t(key, { defaultValue: raw });
    }
    return raw;
  };

  const renderIngredientRow = (ing: Ingredient, index: number) => {
    if (typeof ing === 'string') {
      return (
        <Text key={`ing-${index}`} style={[styles.listItem, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>
          • {ing}
        </Text>
      );
    }

    const qtyValue = ing.amount ?? ing.quantity;
    const quantity = qtyValue != null && qtyValue !== '' ? String(qtyValue) : '';
    const unitLabel = ing.type ? getMeasurementLabel(ing.type, quantity.length > 3 ? 'long' : 'short') : '';
    const displayName = ing.name?.trim() || t('recipes.ingredient');

    return (
      <View
        key={`ing-${index}`}
        style={[
          styles.ingredientRow,
          {
            borderColor: colors.gray[200],
            backgroundColor: colors.gray[50],
          },
        ]}
      >
        <Text style={[styles.ingredientName, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>
          {displayName}
        </Text>
        {(quantity || unitLabel) && (
          <View style={[styles.ingredientBadge, { borderColor: colors.gray[200], backgroundColor: colors.white }]}>
            {!!quantity && <Text style={[styles.ingredientBadgeText, { color: textColors.primary, fontFamily: fonts.bold }]}>{quantity}</Text>}
            {!!unitLabel && <Text style={[styles.ingredientUnitText, { color: colors.primary, fontFamily: fonts.medium }]}>{unitLabel}</Text>}
          </View>
        )}
      </View>
    );
  };

  // Nutrition label translation helper
  const getNutritionLabel = (key: string): string => {
    // Try different key variations
    const variations = [
      key.toLowerCase(), // lowercase: "vitamina"
      key, // original: "VitaminA"
      key.replace(/([A-Z])/g, '_$1').toLowerCase(), // camelCase to snake_case: "vitamin_a"
      key.replace(/_/g, '').toLowerCase(), // snake_case to lowercase: "vitamin_a" -> "vitamina"
    ];

    for (const variation of variations) {
      const translationKey = `recipes.nutritionLabels.${variation}`;
      const translated = t(translationKey, { defaultValue: '' });
      if (translated && translated !== translationKey) {
        return translated;
      }
    }

    // Fallback to formatted key name
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Normalize nutrition data with translations
  const normalizeNutrition = (data: any) => {
    const pairs: [string, any][] = Array.isArray(data) ? data.map((v: any, i: number) => [String(i + 1), v]) : Object.entries(data ?? {});
    return pairs.map(([k, v]) => {
      if (typeof v === 'number') return { label: getNutritionLabel(k), value: `${formatNum(v)} ${unitFor(k)}` };
      const parsed = typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : null;
      return parsed !== null
        ? { label: getNutritionLabel(k), value: `${formatNum(parsed)} ${unitFor(k)}` }
        : { label: getNutritionLabel(k), value: String(v) };
    });
  };

  const onBack = () => {
    if ((router as any).canGoBack?.()) router.back();
    else router.replace('/(tabs)/myRecipe');
  };

  // Normalize the recipe id used by save/unsave
  const getRid = useCallback(() => {
    const r: any = recipe;
    const val = r?.id ?? r?.recipeId ?? effectiveId;
    return Number(val);
  }, [recipe, effectiveId]);

  // Initial fetch + initial saved state
  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const data = await recipeService.getRecipe(Number(effectiveId));
        setRecipe(data);

        const saved = await recipeService.isRecipeSaved(Number(data?.id ?? data?.recipeId ?? effectiveId));
        setIsSaved(saved);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (effectiveId) fetchRecipeDetails();
  }, [effectiveId]);

  // Fetch average easiness score
  useEffect(() => {
    const fetchAverageEasinessScore = async () => {
      if (!effectiveId) return;
      try {
        const response = await recipeService.getAverageEasiness(Number(effectiveId));
        const averageScore = response?.averageEasinessRate;
        if (averageScore !== null && averageScore !== undefined) {
          setAverageEasinessScore(Number(averageScore));
        } else {
          setAverageEasinessScore(null);
        }
      } catch (error) {
        console.error('Error fetching average easiness score:', error);
        setAverageEasinessScore(null);
      }
    };
    if (effectiveId) fetchAverageEasinessScore();
  }, [effectiveId]);

  // Fetch user's own easiness rate
  useEffect(() => {
    const fetchUserEasinessRate = async () => {
      if (!effectiveId) return;
      try {
        const response = await recipeService.getUserEasinessRate(Number(effectiveId));
        const userRate = response?.easinessRate;
        if (userRate !== null && userRate !== undefined) {
          setUserEasinessRate(Number(userRate));
        } else {
          setUserEasinessRate(null);
        }
      } catch (error) {
        console.error('Error fetching user easiness rate:', error);
        setUserEasinessRate(null);
      }
    };
    if (effectiveId) fetchUserEasinessRate();
  }, [effectiveId]);

  const handleRateEasiness = async (newValue: number) => {
    if (!effectiveId || !newValue) return;
    const roundedValue = Math.round(newValue);

    setEasinessRatingLoading(true);
    try {
      // Use the new unified submitRating method
      await recipeService.submitRating(Number(effectiveId), roundedValue, 'easiness');

      // Fetch updated average score
      const response = await recipeService.getAverageEasiness(Number(effectiveId));
      const averageScore = response?.averageEasinessRate;
      if (averageScore !== null && averageScore !== undefined) {
        setAverageEasinessScore(Number(averageScore));
      }

      // Fetch updated user's own rating
      const userRateResponse = await recipeService.getUserEasinessRate(Number(effectiveId));
      const userRate = userRateResponse?.easinessRate;
      if (userRate !== null && userRate !== undefined) {
        setUserEasinessRate(Number(userRate));
      } else {
        setUserEasinessRate(null);
      }
      
      Alert.alert(t('common.success'), t('recipes.easinessRated'));
    } catch (error) {
      console.error('Error submitting easiness rating:', error);
      Alert.alert(t('common.error'), t('recipes.ratingError') || 'Failed to submit rating');
    } finally {
      setEasinessRatingLoading(false);
    }
  };

  const openRatingModal = () => {
    setRatingModalVisible(true);
  };

  // Refresh saved state whenever this screen gains focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const saved = await recipeService.isRecipeSaved(getRid());
          if (active) setIsSaved(saved);
        } catch {}
      })();
      return () => { active = false; };
    }, [getRid])
  );

  // Toggle with server re-check to keep UI in sync
  const onToggleSave = async () => {
    if (saveBusy) return;
    const rid = getRid();
    setSaveBusy(true);
    try {
      const currentlySaved = await recipeService.isRecipeSaved(rid).catch(() => isSaved);
      if (currentlySaved) {
        await recipeService.unsaveRecipe(rid);
      } else {
        await recipeService.saveRecipe(rid);
      }
    } catch {
      Alert.alert(t('common.error'), t('recipes.saveError'));
    }
    // Always re-check from server to reflect true state
    try {
      const fresh = await recipeService.isRecipeSaved(rid);
      setIsSaved(fresh);
    } catch {
      // leave as-is on failure
    } finally {
      setSaveBusy(false);
    }
  };

  // Auto-translate when recipe or global language changes
  useEffect(() => {
    if (!recipe) return;

    let cancelled = false;
    const translateContent = async () => {
      const currentTargetLanguage = mapLanguageToRecipeTarget(i18n.language);
      setTranslating(true);
      try {
        const t = await translateRecipeContent(
          String(recipe.id ?? effectiveId),
          {
            title: recipe.title,
            description: recipe.description,
            tag: recipe.tag,
            type: recipe.type,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
          },
          currentTargetLanguage
        );
        if (!cancelled) {
          // Ensure all translated content is used, with fallback to original
          setTranslated({
            ...recipe,
            title: t.title || recipe.title,
            description: t.description || recipe.description,
            tag: t.tag || recipe.tag,
            type: t.type || recipe.type,
            ingredients: t.ingredients || recipe.ingredients,
            instructions: t.instructions || recipe.instructions,
          });
        }
      } catch (error) {
        if (!cancelled) {
          // On error, just show original content
          setTranslated(null);
        }
      } finally {
        if (!cancelled) {
          setTranslating(false);
        }
      }
    };

    translateContent();
    return () => {
      cancelled = true;
    };
  }, [recipe, i18n.language, effectiveId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: textColors.secondary, marginTop: 8, fontFamily: fonts.regular, lineHeight: lineHeights.base }}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }}>{t('recipes.recipeNotFound')}</Text>
        <TouchableOpacity style={[styles.backBtn, { position: 'relative', marginTop: 12, backgroundColor: colors.primary }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.primaryContrast} />
        </TouchableOpacity>
      </View>
    );
  }

  const Hero = () => (
    <View style={[styles.hero, { paddingTop: insets.top }]}>
      {recipe.photo ? (
        <Image source={{ uri: recipe.photo }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <View style={[styles.heroImage, { backgroundColor: colors.gray[200] }]} />
      )}

      {/* Overlay for title and tag */}
      <View style={styles.heroOverlay}>
        <Text numberOfLines={2} style={[styles.heroTitle, { color: colors.white, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>{translated?.title ?? recipe.title}</Text>
        {!!(translated?.tag ?? recipe.tag) && (
          <View style={[styles.tag, { backgroundColor: colors.primary }]}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.tagText, { color: colors.primaryContrast, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{translated?.tag ?? recipe.tag}</Text>
          </View>
        )}
      </View>

      {/* Back button inside safe area */}
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8, backgroundColor: colors.primary }]} onPress={onBack} accessibilityLabel="Back">
        <Ionicons name="arrow-back" size={20} color={colors.primaryContrast} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, { top: insets.top + 8, opacity: saveBusy ? 0.6 : 1 }]}
        onPress={onToggleSave}
        disabled={saveBusy}
        accessibilityLabel={isSaved ? 'Unsave' : 'Save'}
      >
        <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? colors.primary : '#fff'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.shareBtn, { top: insets.top + 8 }]}
        onPress={() => setShareOpen(true)}
        accessibilityLabel="Share"
      >
        <Ionicons name="share-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Hero />

      {translating ? (
        <View style={{ paddingHorizontal: 12, paddingBottom: 8, paddingTop: 8 }}>
          <Text style={{ color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }}>{t('recipes.translating')}</Text>
        </View>
      ) : null}

      {/* Summary row like MyRecipe cards */}
      <View style={styles.cardRow}>
        <View style={[styles.miniCard, { backgroundColor: colors.white, borderColor: colors.gray[200] }]}>
          <Text style={[styles.miniLabel, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.sm }]}>{t('recipes.calories')}</Text>
          <Text style={[styles.miniValue, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights.base }]}>{recipe.totalCalorie ?? '-'}</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: colors.white, borderColor: colors.gray[200] }]}>
          <Text style={[styles.miniLabel, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.sm }]}>{t('recipes.type')}</Text>
          <Text style={[styles.miniValue, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights.base }]}>{translated?.type ?? recipe.type ?? '-'}</Text>
        </View>
        <View style={[styles.miniCard, { backgroundColor: colors.white, borderColor: colors.gray[200] }]}>
          <Text style={[styles.miniLabel, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.sm }]}>{t('recipes.price')}</Text>
          <Text style={[styles.miniValue, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights.base }]}>{formatPrice(recipe.price, i18n.language)}</Text>
        </View>
      </View>

      {!!(translated?.description ?? recipe.description) && (
        <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.gray[200] }]}>
          <Text style={[styles.sectionTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights.lg }]}>{t('recipes.description')}</Text>
          <Text style={[styles.bodyText, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{translated?.description ?? recipe.description}</Text>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.gray[200] }]}>
        <Text style={[styles.sectionTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights.lg }]}>{t('recipes.ingredients')}</Text>
        {(translated?.ingredients ?? recipe.ingredients)?.length ? (
          (translated?.ingredients ?? recipe.ingredients)!.map((ing, i) => renderIngredientRow(ing, i))
        ) : (
          <Text style={[styles.muted, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{t('recipes.noIngredients')}</Text>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.gray[200] }]}>
        <Text style={[styles.sectionTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights.lg }]}>{t('recipes.instructions')}</Text>
        {(translated?.instructions ?? recipe.instructions)?.length ? (
          (translated?.instructions ?? recipe.instructions)!.map((ins, i) => (
            <Text key={`ins-${i}`} style={[styles.listItem, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{i + 1}. {String(ins)}</Text>
          ))
        ) : (
          <Text style={[styles.muted, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{t('recipes.noInstructions')}</Text>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.gray[200] }]}>
        <Text style={[styles.sectionTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights.lg }]}>{t('recipes.scores')}</Text>
        
        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={[styles.scoreLabel, { color: textColors.secondary, fontFamily: fonts.regular }]}>{t('recipes.healthinessScore')}</Text>
            <View style={styles.ratingContainer}>
              <StarRating rating={recipe.healthinessScore ?? 0} readOnly size={20} />
              <Text style={[styles.scoreValue, { color: textColors.primary, fontFamily: fonts.medium }]}>
                ({recipe.healthinessScore ?? 0})
              </Text>
            </View>
          </View>

          <View style={styles.scoreItem}>
            <Text style={[styles.scoreLabel, { color: textColors.secondary, fontFamily: fonts.regular }]}>{t('recipes.easinessScore')}</Text>
            <View style={styles.ratingContainer}>
              <StarRating 
                rating={averageEasinessScore !== null ? averageEasinessScore : 0} 
                onRatingChange={() => {}} // Disabled here
                readOnly={true}
                size={20}
              />
              <Text style={[styles.scoreValue, { color: textColors.primary, fontFamily: fonts.medium }]}>
                {averageEasinessScore !== null ? `(${averageEasinessScore.toFixed(1)}/5)` : '(0/5)'}
              </Text>
            </View>

            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={[styles.scoreLabel, { color: textColors.secondary, fontFamily: fonts.regular }]}>{t('recipes.yourEasinessRating')}</Text>
              <TouchableOpacity 
                style={styles.ratingContainer}
                onPress={openRatingModal}
                activeOpacity={0.7}
              >
                <StarRating 
                  rating={userEasinessRate !== null ? userEasinessRate : 0} 
                  onRatingChange={openRatingModal}
                  readOnly={true} // Read only here, rating happens in modal
                  size={20}
                />
                <Text style={[styles.scoreValue, { color: textColors.primary, fontFamily: fonts.medium }]}>
                  {userEasinessRate !== null ? `(${userEasinessRate}/5)` : t('recipes.tapToRate')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {!!recipe.nutritionData && (
        <View style={[styles.card, { backgroundColor: colors.white, borderColor: colors.gray[200] }]}>
          <Text style={[styles.sectionTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights.lg }]}>{t('recipes.nutrition')}</Text>
          {(() => {
            const items = normalizeNutrition(recipe.nutritionData);
            if (!items.length) return <Text style={[styles.muted, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{t('recipes.noNutritionData')}</Text>;
            return (
              <View>
                {items.map(({ label, value }, idx) => (
                  <View key={`${label}-${idx}`} style={[styles.nutriRow, { borderBottomColor: colors.gray[200] }, idx === items.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={[styles.nutriName, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{label}</Text>
                    <Text style={[styles.nutriValue, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{value}</Text>
                  </View>
                ))}
              </View>
            );
          })()}
        </View>
      )}

      <View style={{ height: 24 }} />
      {/* Share modal */}
      <ShareModal
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        item={{
          id: recipe?.id ?? Number(effectiveId),
          title: recipe?.title ?? '',
          photo: recipe?.photo ?? 'https://picsum.photos/seed/recipe/300/300',
        }}
        baseUrl="https://heath.app"
      />
      
      {/* Rating Modal */}
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleRateEasiness}
        initialRating={0}
        title={t('recipes.rateEasiness')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { backgroundColor: '#f6f7fb', paddingBottom: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f7fb' },

  // Hero
  hero: { width: '100%', height: 300, backgroundColor: '#e5e7eb', marginBottom: 12 },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroOverlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 2 },
  tag: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, maxWidth: '90%' },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  backBtn: {
    position: 'absolute',
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    position: 'absolute',
    right: 56,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    position: 'absolute',
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cards
  cardRow: { paddingHorizontal: 12, flexDirection: 'row', gap: 12, marginBottom: 4 },
  langChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  langChipText: { fontSize: 13, fontWeight: '600' },
  miniCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  miniLabel: { color: '#6b7280', fontSize: 12 },
  miniValue: { color: '#111827', fontWeight: '700', marginTop: 2 },

  card: {
    marginTop: 10,
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  bodyText: { color: '#1f2937' },
  kv: { color: '#1f2937' },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  ingredientName: { fontSize: 14, fontWeight: '600', flex: 1, paddingRight: 12 },
  ingredientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 90,
  },
  ingredientBadgeText: { fontSize: 16, fontWeight: '700', marginRight: 6 },
  ingredientUnitText: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  listItem: { color: '#1f2937', marginTop: 6 },

  // Nutrition rows
  nutriRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#eef2ff',
    borderBottomWidth: 1,
  },
  nutriName: { color: '#374151', fontWeight: '600' },
  nutriValue: { color: '#111827', fontWeight: '700' },

  muted: { color: '#6b7280', marginTop: 4 },
  
  // Scores
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default RecipeDetail;

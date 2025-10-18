import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, textColors } from '../../constants/theme';
import { recipeService } from '../../services/recipeService';

type Ingredient = string | { name: string; amount?: string | number; quantity?: number };

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

// Pretty labels and units for nutrition keys
const labelMap: Record<string, string> = {
  calories: 'Calories',
  calorie: 'Calories',
  energy: 'Energy',
  protein: 'Protein',
  fat: 'Fat',
  fats: 'Fat',
  carbs: 'Carbs',
  carbohydrate: 'Carbs',
  carbohydrates: 'Carbs',
  sugar: 'Sugar',
  sugars: 'Sugar',
  fiber: 'Fiber',
  sodium: 'Sodium',
  salt: 'Salt',
};
const unitFor = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes('cal')) return 'kcal';
  if (k.includes('sodium') || k.includes('salt')) return 'mg';
  return 'g';
};
const prettyLabel = (key: string) => labelMap[key.toLowerCase()] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const formatNum = (n: number) => {
  const fixed = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return fixed.replace(/\.00$/, '');
};
const normalizeNutrition = (data: any) => {
  const pairs: [string, any][] = Array.isArray(data) ? data.map((v: any, i: number) => [String(i + 1), v]) : Object.entries(data ?? {});
  return pairs.map(([k, v]) => {
    if (typeof v === 'number') return { label: prettyLabel(k), value: `${formatNum(v)} ${unitFor(k)}` };
    const parsed = typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : null;
    return parsed !== null
      ? { label: prettyLabel(k), value: `${formatNum(parsed)} ${unitFor(k)}` }
      : { label: prettyLabel(k), value: String(v) };
  });
};

const displayIngredient = (ing: Ingredient) => {
  if (typeof ing === 'string') return ing;
  const qty = ing.amount ?? ing.quantity;
  return qty !== undefined && qty !== null ? `${ing.name}: ${qty}` : `${ing.name ?? ''}`;
};

const RecipeDetail = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipeId, id } = useLocalSearchParams<{ recipeId?: string; id?: string }>();
  const effectiveId = (recipeId ?? id) as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const onBack = () => {
    // Make sure the back button always works even if there is no history
    if ((router as any).canGoBack?.()) {
      router.back();
    } //else {
      //router.replace('/(tabs)/myRecipe');
    //}
  };

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const data = await recipeService.getRecipe(Number(effectiveId));
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (effectiveId) fetchRecipeDetails();
  }, [effectiveId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: textColors.secondary, marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={{ color: textColors.secondary }}>Recipe not found.</Text>
        <TouchableOpacity style={[styles.backBtn, { position: 'relative', marginTop: 12 }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  const Hero = () => (
    <View style={[styles.hero, { paddingTop: insets.top }]}>
      {recipe.photo ? (
        <Image source={{ uri: recipe.photo }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <View style={[styles.heroImage, { backgroundColor: '#e5e7eb' }]} />
      )}

      {/* Overlay for title and tag */}
      <View style={styles.heroOverlay}>
        <Text numberOfLines={2} style={styles.heroTitle}>{recipe.title}</Text>
        {!!recipe.tag && (
          <View style={styles.tag}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.tagText}>{recipe.tag}</Text>
          </View>
        )}
      </View>

      {/* Back button inside safe area */}
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={onBack} accessibilityLabel="Back">
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <Hero />

      {/* Summary row like MyRecipe cards */}
      <View style={styles.cardRow}>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>Calories</Text>
          <Text style={styles.miniValue}>{recipe.totalCalorie ?? '-'}</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>Type</Text>
          <Text style={styles.miniValue}>{recipe.type ?? '-'}</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>Price</Text>
          <Text style={styles.miniValue}>{recipe.price != null ? `$${recipe.price}` : '-'}</Text>
        </View>
      </View>

      {!!recipe.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.bodyText}>{recipe.description}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients?.length ? (
          recipe.ingredients.map((ing, i) => (
            <Text key={`ing-${i}`} style={styles.listItem}>• {displayIngredient(ing)}</Text>
          ))
        ) : (
          <Text style={styles.muted}>No ingredients listed.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions?.length ? (
          recipe.instructions.map((ins, i) => (
            <Text key={`ins-${i}`} style={styles.listItem}>{i + 1}. {String(ins)}</Text>
          ))
        ) : (
          <Text style={styles.muted}>No instructions provided.</Text>
        )}
      </View>

      {(recipe.healthinessScore != null || recipe.easinessScore != null) && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scores</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={styles.kv}>Healthiness: {recipe.healthinessScore ?? '-'}</Text>
            <Text style={styles.kv}>Easiness: {recipe.easinessScore ?? '-'}</Text>
          </View>
        </View>
      )}

      {!!recipe.nutritionData && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          {(() => {
            const items = normalizeNutrition(recipe.nutritionData);
            if (!items.length) return <Text style={styles.muted}>No nutrition data.</Text>;
            return (
              <View>
                {items.map(({ label, value }, idx) => (
                  <View key={`${label}-${idx}`} style={[styles.nutriRow, idx === items.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={styles.nutriName}>{label}</Text>
                    <Text style={styles.nutriValue}>{value}</Text>
                  </View>
                ))}
              </View>
            );
          })()}
        </View>
      )}

      <View style={{ height: 24 }} />
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
  tag: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.primary, borderRadius: 12, maxWidth: '90%' },
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

  // Cards
  cardRow: { paddingHorizontal: 12, flexDirection: 'row', gap: 12, marginBottom: 4 },
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
});

export default RecipeDetail;

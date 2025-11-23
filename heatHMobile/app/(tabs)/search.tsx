// ...existing code...
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { semanticSearchService } from '@/services/semanticSearchService';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { translateTextContent, mapLanguageToRecipeTarget } from '../../services/translationService';
import { formatPrice } from '../../services/currencyService';

export default function SearchScreen() {
  const { colors, textColors, borderColors, fonts, lineHeights } = useThemeColors();
  const { t } = useTranslation();
  const MIN_QUERY_LENGTH = 3;
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translatedTitles, setTranslatedTitles] = useState<Map<number, string>>(new Map());

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    // clear previous debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }

    // if query is empty, reset results + state
    if (!trimmed) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // if query is too short, don't search yet
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // debounce the search to run 500ms after the last keystroke
    debounceTimeout.current = setTimeout(() => {
      const currentRequest = ++requestId.current;
      setLoading(true);
      setError(null);

      (async () => {
        try {
          const data = await semanticSearchService.search(trimmed, 10);
          // ignore stale responses
          if (currentRequest !== requestId.current) return;
          setResults(data.results || data || []);
        } catch (err: any) {
          if (currentRequest !== requestId.current) return;
          setError(err?.response?.data?.message || t('search.failedToSearch'));
          console.error('Search error:', err);
        } finally {
          if (currentRequest !== requestId.current) return;
          setLoading(false);
        }
      })();
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }
    };
  }, [query]);

  // Translate recipe titles when results or language changes
  useEffect(() => {
    if (results.length === 0) {
      setTranslatedTitles(new Map());
      return;
    }

    let cancelled = false;
    const translateTitles = async () => {
      const targetLang = mapLanguageToRecipeTarget(i18n.language);
      const translations = new Map<number, string>();

      await Promise.all(
        results.map(async (recipe) => {
          try {
            if (recipe.title) {
              const translated = await translateTextContent(recipe.title, targetLang);
              if (!cancelled) {
                translations.set(recipe.id, translated);
              }
            }
          } catch (error) {
            // Ignore translation errors
          }
        })
      );

      if (!cancelled) {
        setTranslatedTitles(translations);
      }
    };

    translateTitles();
    return () => {
      cancelled = true;
    };
  }, [results, i18n.language]);

  const renderRecipeItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        // navigate to details page using query param 'id'
        router.push({ pathname: '/recipeDetail/recipeDetail', params: { recipeId: String(item.id) } });
      }}
    >
      <View style={[styles.recipeCard, { backgroundColor: colors.white }]}>
        {item.photo && (
          <Image 
            source={{ uri: item.photo }} 
            style={[styles.recipeImage, { backgroundColor: colors.gray[100] }]}
            resizeMode="cover"
          />
        )}
        <View style={styles.recipeInfo}>
          <Text style={[styles.recipeTitle, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{translatedTitles.get(item.id) ?? item.title ?? t('recipes.untitledRecipe')}</Text>
          {item.tag && <Text style={[styles.recipeTag, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>{t('search.tag')}: {item.tag}</Text>}
          {item.type && <Text style={[styles.recipeType, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>{t('search.type')}: {item.type}</Text>}
          {item.totalCalorie !== undefined && (
            <Text style={[styles.recipeCalories, { color: colors.warning }]}>{t('search.calories')}: {item.totalCalorie}</Text>
          )}
          {item.price !== undefined && (
            <Text style={[styles.recipePrice, { color: colors.success }]}>{t('search.price')}: {formatPrice(item.price, i18n.language)}</Text>
          )}
          {item.similarity !== undefined && (
            <Text style={[styles.recipeSimilarity, { color: colors.info }]}>
              {t('search.match')}: {(item.similarity * 100).toFixed(1)}%
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const trimmed = query.trim();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPaper }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.white, borderBottomColor: borderColors.light }]}>
        <TextInput
          style={[styles.searchInput, { borderColor: borderColors.medium, backgroundColor: colors.white, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
          placeholder={t('search.placeholder')}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.gray[50], borderLeftColor: colors.error }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{t('search.searching')}</Text>
        </View>
      )}

      {!loading && results.length === 0 && trimmed.length >= MIN_QUERY_LENGTH && !error && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColors.disabled, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>{t('search.noResults')}</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderRecipeItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
        />
      )}

      {!trimmed && !loading && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColors.disabled, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>
            {t('search.enterQuery')}
          </Text>
        </View>
      )}

      {trimmed.length > 0 && trimmed.length < MIN_QUERY_LENGTH && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColors.disabled, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>
            {t('search.minCharacters', { count: MIN_QUERY_LENGTH })}
          </Text>
        </View>
      )}
    </View>
  );
}

// ...existing styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  errorText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  recipeCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeTag: {
    fontSize: 14,
    marginBottom: 4,
  },
  recipeType: {
    fontSize: 14,
    marginBottom: 4,
  },
  recipeCalories: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  recipePrice: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  recipeSimilarity: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
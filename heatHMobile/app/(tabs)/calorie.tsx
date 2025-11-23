import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { useThemeColors } from '../../hooks/useThemeColors';
import { calorieService } from '../../services/calorieService';
import { recipeService } from '../../services/recipeService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { translateTextContent, mapLanguageToRecipeTarget } from '../../services/translationService';

export default function CalorieScreen() {
  const { colors, textColors, fonts } = useThemeColors();
  const { t, i18n: i18nHook } = useTranslation();

  // State for date selection
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSelectedDatePicker, setShowSelectedDatePicker] = useState(false);

  // State for tracking data
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // State for adding new tracking
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [portion, setPortion] = useState('1');
  const [eatenDate, setEatenDate] = useState(new Date()); // Default to selectedDate when opening modal
  const [showEatenDatePicker, setShowEatenDatePicker] = useState(false);
  const [addingTracking, setAddingTracking] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState<Record<number, any>>({});
  const [translatedRecipeNames, setTranslatedRecipeNames] = useState<Map<number, string>>(new Map());
  const [translatedSelectedRecipeTitle, setTranslatedSelectedRecipeTitle] = useState<string | null>(null);
  const [translatedRecipeTitles, setTranslatedRecipeTitles] = useState<Map<number, string>>(new Map());
  const [dailyMacros, setDailyMacros] = useState({ p: 0, f: 0, c: 0 });

  // Chart State
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');
  const [chartMetric, setChartMetric] = useState<'calories' | 'protein' | 'fat' | 'carbs'>('calories');
  const [chartData, setChartData] = useState<any>(null);
  const [chartStats, setChartStats] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Auto-fetch when selectedDate changes
  useEffect(() => {
    fetchTrackingData();
  }, [selectedDate]);

  useEffect(() => {
    let p = 0, f = 0, c = 0;
    trackingData.forEach(item => {
        const recipeId = item.recipeId || item.id;
        const details = recipeDetails[recipeId];
        const portion = item.portion ? (typeof item.portion === 'string' ? parseFloat(item.portion) : item.portion) : 1;
        
        if (details?.nutritionData) {
            const getVal = (keyPart: string) => {
                const entry = Object.entries(details.nutritionData).find(([k]) => k.toLowerCase().includes(keyPart));
                if (!entry) return 0;
                let v = entry[1];
                if (typeof v === 'string') v = parseFloat(v);
                return (typeof v === 'number' && !isNaN(v)) ? v : 0;
            };
            p += getVal('protein') * portion;
            f += (getVal('fat') || getVal('fats')) * portion;
            c += (getVal('carb') || getVal('carbohydrate')) * portion;
        }
    });
    setDailyMacros({ p, f, c });
  }, [trackingData, recipeDetails]);

  useEffect(() => {
    if (chartStats.length > 0) {
        updateChartDisplay();
    }
  }, [chartMetric, chartStats]);

  const updateChartDisplay = () => {
      if (!chartStats.length) return;
      
      const labels = chartStats.map((item: any) => item.label);
      const data = chartStats.map((item: any) => item[chartMetric]);
      
      setChartData({
          labels,
          datasets: [{ data }]
      });
  };

  const fetchChartData = async (period: 'week' | 'month') => {
    setLoadingChart(true);
    setChartPeriod(period);
    try {
      const days = period === 'week' ? 7 : 30;
      const dates: Date[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d);
      }

      const trackingResults = await Promise.all(
        dates.map(d => calorieService.getUserTracking(formatDate(d)).catch(() => []))
      );

      const allRecipeIds = new Set<number>();
      trackingResults.forEach((dayData: any) => {
        if (Array.isArray(dayData)) {
          dayData.forEach((item: any) => {
             const id = item.recipeId || item.id;
             if (id) allRecipeIds.add(Number(id));
          });
        }
      });

      const currentDetails = { ...recipeDetails };
      const missingIds = Array.from(allRecipeIds).filter(id => !currentDetails[id]);

      if (missingIds.length > 0) {
          await Promise.all(missingIds.map(async (id) => {
              try {
                  const r = await recipeService.getRecipe(id);
                  currentDetails[id] = r;
              } catch (e) {
                  // ignore
              }
          }));
          setRecipeDetails(prev => ({ ...prev, ...currentDetails }));
      }

      const statsData = dates.map((date, index) => {
          const dayTracking = trackingResults[index];
          let stats = { calories: 0, protein: 0, fat: 0, carbs: 0, label: date.getDate().toString() };
          
          if (Array.isArray(dayTracking)) {
              dayTracking.forEach((item: any) => {
                  const id = Number(item.recipeId || item.id);
                  const details = currentDetails[id];
                  const portion = item.portion ? (typeof item.portion === 'string' ? parseFloat(item.portion) : item.portion) : 1;
                  
                  if (details) {
                      const getVal = (keyPart: string) => {
                          if (!details.nutritionData) return 0;
                          const entry = Object.entries(details.nutritionData).find(([k]) => k.toLowerCase().includes(keyPart));
                          if (!entry) return 0;
                          let v = entry[1];
                          if (typeof v === 'string') v = parseFloat(v);
                          return (typeof v === 'number' && !isNaN(v)) ? v : 0;
                      };

                      stats.protein += getVal('protein') * portion;
                      stats.fat += (getVal('fat') || getVal('fats')) * portion;
                      stats.carbs += (getVal('carb') || getVal('carbohydrate')) * portion;
                      
                      const cal = details.totalCalorie || details.calories || details.calorie || item.calorie || 0;
                      stats.calories += cal * portion;
                  } else {
                       stats.calories += (item.calorie || 0);
                  }
              });
          }
          return stats;
      });
      
      // Filter labels for month view to avoid clutter?
      if (period === 'month') {
          statsData.forEach((d, i) => {
              if (i % 5 !== 0) d.label = ''; // Only show every 5th label
          });
      }
      
      setChartStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChart(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoadingRecipes(true);
      
      const [myRecipes, savedRecipes] = await Promise.all([
        recipeService.getAllRecipesForAll().catch(() => []),
        recipeService.getSavedRecipes().catch(() => [])
      ]);
      
      const normalizedSaved = (savedRecipes || []).map((item: any) => {
         return item.recipe || item;
      });

      const allRecipes = [...(myRecipes || []), ...normalizedSaved];
      const validRecipes = allRecipes.filter(item => item && (item.id || item.recipeId));
      
      const uniqueRecipes = Array.from(new Map(validRecipes.map(item => {
          const id = item.id || item.recipeId;
          return [id, { ...item, id }];
      })).values());
      
      setRecipes(uniqueRecipes);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  // Effect to check if selected recipe is already tracked for the eaten date
  useEffect(() => {
    if (selectedRecipe && formatDate(eatenDate) === formatDate(selectedDate)) {
        const existing = trackingData.find(t => (t.recipeId || t.id) === selectedRecipe.id);
        if (existing) {
            setPortion(String(existing.portion || 1));
        }
    }
  }, [selectedRecipe, eatenDate, selectedDate, trackingData]);

  // Translate recipe names when tracking data or language changes
  useEffect(() => {
    if (trackingData.length === 0) {
      setTranslatedRecipeNames(new Map());
      return;
    }

    let cancelled = false;
    const translateNames = async () => {
      const targetLang = mapLanguageToRecipeTarget(i18nHook.language);
      const translations = new Map<number, string>();

      await Promise.all(
        trackingData.map(async (item: any) => {
          try {
            const recipeId = item.recipeId || item.id;
            if (recipeId && item.name) {
              const translated = await translateTextContent(item.name, targetLang);
              if (!cancelled) {
                translations.set(recipeId, translated);
              }
            }
          } catch (error) {
            // Ignore translation errors
          }
        })
      );

      if (!cancelled) {
        setTranslatedRecipeNames(translations);
      }
    };

    translateNames();
    return () => {
      cancelled = true;
    };
  }, [trackingData, i18nHook.language]);

  // Translate selected recipe title when it changes
  useEffect(() => {
    if (!selectedRecipe?.title) {
      setTranslatedSelectedRecipeTitle(null);
      return;
    }

    let cancelled = false;
    const translateTitle = async () => {
      const targetLang = mapLanguageToRecipeTarget(i18nHook.language);
      try {
        const translated = await translateTextContent(selectedRecipe.title, targetLang);
        if (!cancelled) {
          setTranslatedSelectedRecipeTitle(translated);
        }
      } catch (error) {
        if (!cancelled) {
          setTranslatedSelectedRecipeTitle(null);
        }
      }
    };

    translateTitle();
    return () => {
      cancelled = true;
    };
  }, [selectedRecipe?.title, i18nHook.language]);

  // Translate recipe titles in selector when recipes or language changes
  useEffect(() => {
    if (recipes.length === 0) {
      setTranslatedRecipeTitles(new Map());
      return;
    }

    let cancelled = false;
    const translateTitles = async () => {
      const targetLang = mapLanguageToRecipeTarget(i18nHook.language);
      const translations = new Map<number, string>();

      await Promise.all(
        recipes.map(async (recipe: any) => {
          try {
            if (recipe.title && recipe.id) {
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
        setTranslatedRecipeTitles(translations);
      }
    };

    translateTitles();
    return () => {
      cancelled = true;
    };
  }, [recipes, i18nHook.language]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const formatDisplayDate = (date: Date) => {
    const lang = i18nHook.language || 'en';
    // Map i18n language codes to locale codes
    let locale = 'en-US';
    if (lang.startsWith('tr')) locale = 'tr-TR';
    else if (lang.startsWith('ja')) locale = 'ja-JP';
    
    return date.toLocaleDateString(locale, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const dateStr = formatDate(selectedDate);
      const data = await calorieService.getUserTracking(dateStr);
      const validData = Array.isArray(data) ? data : [];
      setTrackingData(validData);

      // Fetch nutrition details for recipes in tracking list
      const uniqueIds = Array.from(new Set(validData.map((it: any) => it.recipeId || it.id).filter(Boolean)));
      if (uniqueIds.length > 0) {
          const details: Record<number, any> = {};
          await Promise.all(uniqueIds.map(async (id: any) => {
              try {
                  const r = await recipeService.getRecipe(Number(id));
                  details[Number(id)] = r;
              } catch (e) {
                  console.warn('Failed to fetch recipe details for id:', id);
              }
          }));
          setRecipeDetails(prev => ({ ...prev, ...details }));
      }
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
      setTrackingData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTracking = async () => {
    if (!selectedRecipe) {
      Alert.alert('Required', 'Please select a recipe.');
      return;
    }

    const portionNum = parseFloat(portion.replace(',', '.'));
    if (isNaN(portionNum) || portionNum <= 0) {
      Alert.alert(t('alerts.validationError'), t('calorie.invalidPortion'));
      return;
    }

    try {
      setAddingTracking(true);
      
      const isCurrentDate = formatDate(eatenDate) === formatDate(selectedDate);
      const existingItem = isCurrentDate 
         ? trackingData.find(t => (t.recipeId || t.id) === selectedRecipe.id) 
         : null;

      if (isEditing || existingItem) {
        await calorieService.updateCalorieTracking(
          formatDate(eatenDate),
          selectedRecipe.id,
          portionNum
        );
        // Alert.alert('Success', 'Entry updated.');
      } else if (isCurrentDate) {
        // We know it doesn't exist on the current date, so toggle (add)
        await calorieService.toggleCalorieTracking(
          formatDate(eatenDate),
          selectedRecipe.id,
          portionNum
        );
      } else {
        // Use eatenDate from the modal state
        // Try update first just in case it exists but we don't know (different date)
        try {
            await calorieService.updateCalorieTracking(
              formatDate(eatenDate),
              selectedRecipe.id,
              portionNum
            );
        } catch (e) {
            // If update failed (likely not found), then toggle (add)
            await calorieService.toggleCalorieTracking(
              formatDate(eatenDate),
              selectedRecipe.id,
              portionNum
            );
        }
      }

      closeAddModal();
      
      // Refresh tracking data if we added/updated to the currently viewed date
      if (formatDate(eatenDate) === formatDate(selectedDate)) {
        fetchTrackingData();
      } else if (!isEditing) {
        Alert.alert('Success', 'Entry added to ' + formatDisplayDate(eatenDate));
      }
    } catch (err) {
      console.error('Failed to save tracking:', err);
      Alert.alert('Error', 'Failed to save entry.');
    } finally {
      setAddingTracking(false);
    }
  };

  const handleRemoveItem = async (item: any) => {
    Alert.alert(
      'Remove Entry',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await calorieService.toggleCalorieTracking(
                formatDate(selectedDate),
                item.recipeId || item.id, // Use recipeId from tracking data
                item.portion || 1 // Use stored portion if available, else 1
              );
              fetchTrackingData();
            } catch (err) {
              console.error('Failed to remove item:', err);
              Alert.alert('Error', 'Could not remove item.');
            }
          }
        }
      ]
    );
  };

  const onSelectedDateChange = (event: any, date?: Date) => {
    setShowSelectedDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const onEatenDateChange = (event: any, date?: Date) => {
    setShowEatenDatePicker(Platform.OS === 'ios');
    if (date) {
      setEatenDate(date);
    }
  };

  const calculateTotalCalories = () => {
    return trackingData.reduce((total, item) => total + (item.calorie || 0), 0);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEatenDate(selectedDate); // Default to currently viewed date
    setSelectedRecipe(null);
    setPortion('1');
    setSearchQuery('');
    setShowRecipeSelector(false); // Reset selector state
    setShowAddModal(true);
  };

  const openEditModal = (item: any) => {
    setIsEditing(true);
    setEatenDate(selectedDate);
    
    const recipeId = item.recipeId || item.id;
    const existingRecipe = recipes.find(r => r.id === recipeId);
    
    if (existingRecipe) {
        setSelectedRecipe(existingRecipe);
    } else {
        const unitCalorie = item.portion ? (item.calorie / item.portion) : 0;
        setSelectedRecipe({
            id: recipeId,
            title: item.name,
            image: item.image || item.photo,
            calories: unitCalorie, 
            calorie: unitCalorie
        });
    }
    
    setPortion(String(item.portion || 1));
    setShowRecipeSelector(false);
    setShowAddModal(true);
  };
  
  const closeAddModal = () => {
    setShowAddModal(false);
    // Resetting state after closing can be done here if needed
  };

  const renderTrackedItem = ({ item }: { item: any }) => {
    const imageUri = item.image || item.photo;
    const recipeId = item.recipeId || item.id;
    const details = recipeDetails[recipeId];
    
    const getMacro = (keyPart: string) => {
        if (!details?.nutritionData) return null;
        const entry = Object.entries(details.nutritionData).find(([k]) => k.toLowerCase().includes(keyPart));
        if (!entry) return null;
        
        const val = entry[1];
        let numVal = 0;
        if (typeof val === 'number') numVal = val;
        else if (typeof val === 'string') numVal = parseFloat(val);
        
        if (isNaN(numVal) || numVal === 0) return null;
        
        const p = item.portion ? (typeof item.portion === 'string' ? parseFloat(item.portion) : item.portion) : 1;
        return (numVal * p).toFixed(1);
    };

    const protein = getMacro('protein');
    const fat = getMacro('fat') || getMacro('fats');
    const carbs = getMacro('carb') || getMacro('carbohydrate');
    // Calculate portion if not provided correctly by backend
    // portion = (item.calorie / totalCalorieOfRecipe)
    let displayPortion = item.portion != null ? item.portion : 1;
    const totalCal = details?.totalCalorie || details?.calories || details?.calorie || item.calorie; // fallback to item calorie if detail missing

    // If we have total calories for the recipe and the item has a calorie count, we can try to infer portion
    // if the portion field is missing or seems default (1) but calories differ significantly.
    if (details && totalCal > 0 && item.calorie > 0) {
         // Round to nearest 0.1 to avoid floating point mess
         const calculated = Math.round((item.calorie / totalCal) * 10) / 10;
         // Use calculated if it deviates significantly from the stored portion or if stored portion is missing
         if (!item.portion || Math.abs(calculated - (item.portion || 1)) > 0.1) {
             displayPortion = calculated;
         }
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.white, shadowColor: colors.gray[200] }]}>
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={() => router.push({ pathname: '/recipeDetail/recipeDetail', params: { recipeId: String(item.recipeId) } } as any)}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.cardThumbnail} />
          ) : (
            <View style={[styles.cardThumbnailPlaceholder, { backgroundColor: colors.gray[100] }]}>
              <Ionicons name="restaurant" size={20} color={colors.gray[400]} />
            </View>
          )}
          <View style={styles.cardInfo}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 8}}>
                <Text style={[styles.cardTitle, { fontFamily: fonts.bold, color: textColors.primary, flex: 1 }]} numberOfLines={1}>
                  {translatedRecipeNames.get(item.recipeId || item.id) ?? (item.name || 'Unknown Recipe')}
                </Text>
                <View style={{backgroundColor: colors.gray[100], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4}}>
                     <Text style={{fontSize: 10, fontFamily: fonts.medium, color: textColors.secondary}}>
                         {displayPortion} {t('calorie.portion')}{displayPortion != 1 ? 's' : ''}
                     </Text>
                </View>
            </View>
            <Text style={[styles.cardSubtitle, { fontFamily: fonts.regular, color: textColors.secondary }]}>
               {item.calorie?.toFixed(0) || 0} kcal
            </Text>
            {(protein || fat || carbs) && (
                <View style={{flexDirection: 'row', marginTop: 4, flexWrap: 'wrap'}}>
                    {protein && <Text style={{fontSize: 12, color: textColors.secondary, marginRight: 8, fontFamily: fonts.medium}}>P: {protein}g </Text>}
                    {fat && <Text style={{fontSize: 12, color: textColors.secondary, marginRight: 8, fontFamily: fonts.medium}}>F: {fat}g </Text>}
                    {carbs && <Text style={{fontSize: 12, color: textColors.secondary, fontFamily: fonts.medium}}>C: {carbs}g</Text>}
                </View>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleRemoveItem(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRecipeItem = ({ item }: { item: any }) => {
    const imageUri = item.image || item.photo;
    return (
      <TouchableOpacity
        style={[styles.recipeItem, { borderBottomColor: colors.gray[100] }]}
        onPress={() => {
          setSelectedRecipe(item);
          setShowRecipeSelector(false);
        }}
      >
        <View style={styles.recipeItemContent}>
          {imageUri ? (
             <Image source={{ uri: imageUri }} style={styles.recipeItemImage} />
          ) : (
             <View style={[styles.recipeItemImagePlaceholder, { backgroundColor: colors.gray[100] }]}>
               <Ionicons name="image-outline" size={20} color={colors.gray[400]} />
             </View>
          )}
          <View style={{flex: 1}}>
              <Text style={[styles.recipeItemText, { fontFamily: fonts.medium, color: textColors.primary }]}>{translatedRecipeTitles.get(item.id) ?? item.title}</Text>
              <Text style={[styles.recipeItemCal, { fontFamily: fonts.regular, color: textColors.secondary }]}>
                  {item.totalCalorie || item.calories || item.calorie || 0} kcal
              </Text>
          </View>
          {selectedRecipe?.id === item.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderChartContent = () => {
    const screenWidth = Dimensions.get('window').width;
    
    // Customize color based on metric
    let metricColor: string = colors.primary;
    if (chartMetric === 'protein') metricColor = '#4ECDC4';
    else if (chartMetric === 'fat') metricColor = '#FF6B6B';
    else if (chartMetric === 'carbs') metricColor = '#FFD93D';

    const chartConfig = {
      backgroundGradientFrom: colors.white,
      backgroundGradientTo: colors.white,
      color: (opacity = 1) => metricColor,
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false,
      labelColor: (opacity = 1) => textColors.secondary,
      decimalPlaces: 0,
      propsForDots: {
          r: "4",
          strokeWidth: "2",
          stroke: metricColor
      }
    };

    return (
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.gray[200] }]}>
              <TouchableOpacity onPress={() => setShowChartModal(false)}>
                  <Text style={[styles.modalCancel, { fontFamily: fonts.medium, color: colors.gray[600] }]}>{t('calorie.close')}</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { fontFamily: fonts.bold, color: textColors.primary }]}>{t('calorie.analytics')}</Text>
              <View style={{width: 40}} />
          </View>

          <ScrollView style={styles.modalBody}>
              {/* Period Selector */}
              <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 20, backgroundColor: colors.gray[100], padding: 4, borderRadius: 8}}>
                  {(['week', 'month'] as const).map((p) => (
                      <TouchableOpacity
                          key={p}
                          style={{
                              paddingVertical: 6,
                              paddingHorizontal: 20,
                              backgroundColor: chartPeriod === p ? colors.white : 'transparent',
                              borderRadius: 6,
                              shadowColor: chartPeriod === p ? '#000' : 'transparent',
                              shadowOpacity: chartPeriod === p ? 0.1 : 0,
                              shadowRadius: 2,
                              elevation: chartPeriod === p ? 2 : 0,
                          }}
                          onPress={() => fetchChartData(p)}
                      >
                          <Text style={{
                              fontFamily: chartPeriod === p ? fonts.bold : fonts.medium,
                              color: chartPeriod === p ? textColors.primary : textColors.secondary,
                              textTransform: 'capitalize'
                          }}>{p === 'week' ? t('calorie.weekly') : t('calorie.monthly')}</Text>
                      </TouchableOpacity>
                  ))}
              </View>

              {/* Metric Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
                  {(['calories', 'protein', 'fat', 'carbs'] as const).map((m) => {
                      let mColor: string = colors.primary;
                      if (m === 'protein') mColor = '#4ECDC4';
                      else if (m === 'fat') mColor = '#FF6B6B';
                      else if (m === 'carbs') mColor = '#FFD93D';
                      
                      return (
                      <TouchableOpacity
                          key={m}
                          style={{
                              marginRight: 10,
                              paddingVertical: 8,
                              paddingHorizontal: 16,
                              backgroundColor: chartMetric === m ? mColor : colors.gray[100],
                              borderRadius: 20,
                          }}
                          onPress={() => setChartMetric(m)}
                      >
                          <Text style={{
                              fontFamily: fonts.medium,
                              color: chartMetric === m ? '#fff' : textColors.secondary,
                              textTransform: 'capitalize'
                          }}>{t(`calorie.${m}`)}</Text>
                      </TouchableOpacity>
                  )})}
              </ScrollView>

              {loadingChart ? (
                  <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 40}} />
              ) : (
                  chartData && (
                      <View style={{alignItems: 'center'}}>
                          <LineChart
                            data={chartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                            fromZero
                            yAxisLabel=""
                            yAxisSuffix={chartMetric === 'calories' ? '' : 'g'}
                          />
                          <Text style={{marginTop: 10, fontFamily: fonts.regular, color: textColors.secondary, textAlign: 'center'}}>
                              {chartMetric === 'calories' ? t('calorie.totalCaloriesPerDay') : 
                               chartMetric === 'protein' ? t('calorie.totalProteinPerDay') :
                               chartMetric === 'fat' ? t('calorie.totalFatPerDay') :
                               t('calorie.totalCarbsPerDay')}
                          </Text>
                      </View>
                  )
              )}
          </ScrollView>
      </View>
    );
  };

  const renderAddContent = () => {
    const selectedImageUri = selectedRecipe?.image || selectedRecipe?.photo;
    return (
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.gray[200] }]}>
              <TouchableOpacity onPress={closeAddModal}>
                  <Text style={[styles.modalCancel, { fontFamily: fonts.medium, color: colors.gray[600] }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { fontFamily: fonts.bold, color: textColors.primary }]}>{isEditing ? t('calorie.editEntry') : t('calorie.addEntry')}</Text>
              <TouchableOpacity onPress={handleAddTracking} disabled={addingTracking}>
                  {addingTracking ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                      <Text style={[styles.modalDone, { fontFamily: fonts.bold, color: colors.primary }]}>{isEditing ? t('calorie.update') : t('common.save')}</Text>
                  )}
              </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
              {/* Date Selection in Modal */}
              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { fontFamily: fonts.medium, color: textColors.secondary }]}>{t('calorie.date')}</Text>
                  <View style={[styles.dateInputRow, { opacity: isEditing ? 0.5 : 1 }]}>
                      {Platform.OS === 'android' ? (
                          <TouchableOpacity 
                              style={[styles.inputButton, { borderColor: colors.gray[300] }]}
                              onPress={() => !isEditing && setShowEatenDatePicker(true)}
                              disabled={isEditing}
                          >
                              <Text style={{ fontFamily: fonts.regular, color: textColors.primary }}>{formatDisplayDate(eatenDate)}</Text>
                          </TouchableOpacity>
                      ) : (
                           <View pointerEvents={isEditing ? 'none' : 'auto'}>
                               <DateTimePicker
                                  value={eatenDate}
                                  mode="date"
                                  display="default"
                                  onChange={onEatenDateChange}
                                  style={{ alignSelf: 'flex-start' }}
                               />
                           </View>
                      )}
                  </View>
                  {Platform.OS === 'android' && showEatenDatePicker && (
                       <DateTimePicker
                          value={eatenDate}
                          mode="date"
                          display="default"
                          onChange={onEatenDateChange}
                       />
                  )}
              </View>

              {/* Recipe Selection */}
              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { fontFamily: fonts.medium, color: textColors.secondary }]}>{t('recipes.recipe')}</Text>
                  <TouchableOpacity
                      style={[styles.inputButton, { borderColor: colors.gray[300], backgroundColor: isEditing ? colors.gray[100] : 'transparent' }]}
                      onPress={() => !isEditing && setShowRecipeSelector(true)}
                      disabled={isEditing}
                  >
                      {selectedRecipe ? (
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              {selectedImageUri && (
                                  <Image source={{uri: selectedImageUri}} style={{width: 30, height: 30, borderRadius: 4, marginRight: 8}} />
                              )}
                              <Text style={{ fontFamily: fonts.regular, color: textColors.primary, flex: 1 }} numberOfLines={1}>
                                  {translatedSelectedRecipeTitle ?? selectedRecipe.title}
                              </Text>
                          </View>
                      ) : (
                          <Text style={{ fontFamily: fonts.regular, color: colors.gray[400] }}>{t('calorie.selectRecipe')}</Text>
                      )}
                      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                  </TouchableOpacity>
              </View>

              {/* Portion Input */}
              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { fontFamily: fonts.medium, color: textColors.secondary }]}>{t('calorie.portion')}</Text>
                  <View style={[styles.textInputWrapper, { borderColor: colors.gray[300] }]}>
                      <TextInput
                          style={[styles.textInput, { fontFamily: fonts.regular, color: textColors.primary }]}
                          value={portion}
                          onChangeText={setPortion}
                          keyboardType="decimal-pad"
                          placeholder="1.0"
                          placeholderTextColor={colors.gray[400]}
                      />
                      <Text style={{ fontFamily: fonts.medium, color: colors.gray[500], marginRight: 12 }}>{t('calorie.servings')}</Text>
                  </View>
              </View>
              
              {selectedRecipe && (
                   <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name="information-circle-outline" size={20} color={colors.primary} style={{marginRight: 8}} />
                      <Text style={{ fontFamily: fonts.medium, color: colors.primary }}>
                          {t('calorie.total')}: {(selectedRecipe.totalCalorie || selectedRecipe.calories || selectedRecipe.calorie || 0) * (parseFloat(portion) || 0)} kcal
                      </Text>
                   </View>
              )}
          </ScrollView>
      </View>
    );
  };

  const renderRecipeSelectorContent = () => {
    const filteredRecipes = recipes.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
         <View style={[styles.modalHeader, { borderBottomColor: colors.gray[200] }]}>
            <TouchableOpacity onPress={() => setShowRecipeSelector(false)}>
                <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { fontFamily: fonts.bold, color: textColors.primary }]}>{t('calorie.selectRecipe')}</Text>
            <View style={{width: 24}} />
        </View>
        
        <View style={{paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100]}}>
            <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray[100], borderRadius: 8, paddingHorizontal: 12}}>
                <Ionicons name="search" size={20} color={colors.gray[400]} />
                <TextInput
                    style={{flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontFamily: fonts.regular, color: textColors.primary}}
                    placeholder="Search recipes..."
                    placeholderTextColor={colors.gray[400]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={colors.gray[400]} />
                    </TouchableOpacity>
                )}
            </View>
        </View>

         {loadingRecipes ? (
             <ActivityIndicator style={{marginTop: 40}} color={colors.primary} />
         ) : (
             <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRecipeItem}
                contentContainerStyle={{ padding: 16 }}
                ItemSeparatorComponent={() => <View style={{height: 1}} />}
                ListEmptyComponent={
                    <Text style={{textAlign: 'center', marginTop: 20, color: textColors.secondary, fontFamily: fonts.regular}}>
                        No recipes found
                    </Text>
                }
             />
         )}
    </View>
  );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.gray[200] }]}>
        <View style={styles.dateSelector}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center'}}>
                <TouchableOpacity onPress={() => {
                    const prevDate = new Date(selectedDate);
                    prevDate.setDate(selectedDate.getDate() - 1);
                    setSelectedDate(prevDate);
                }} style={{padding: 8}}>
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                
                {Platform.OS === 'ios' ? (
                   <DateTimePicker
                      testID="dateTimePicker"
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={onSelectedDateChange}
                   />
                ) : (
                  <TouchableOpacity onPress={() => setShowSelectedDatePicker(true)} style={styles.dateDisplay}>
                      <Ionicons name="calendar-outline" size={18} color={textColors.primary} style={{marginRight: 8}} />
                      <Text style={[styles.dateText, { fontFamily: fonts.bold, color: textColors.primary }]}>
                          {formatDisplayDate(selectedDate)}
                      </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => {
                    const nextDate = new Date(selectedDate);
                    nextDate.setDate(selectedDate.getDate() + 1);
                    setSelectedDate(nextDate);
                }} style={{padding: 8}}>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                onPress={() => { setShowChartModal(true); fetchChartData('week'); }}
                style={{position: 'absolute', right: 0}}
            >
                <Ionicons name="stats-chart" size={24} color={colors.primary} />
            </TouchableOpacity>
        </View>

        {/* Total Calories Card */}
        <View style={styles.summaryContainer}>
            <Text style={[styles.summaryLabel, { fontFamily: fonts.medium, color: textColors.secondary }]}>{t('calorie.totalIntake')}</Text>
            <View style={styles.summaryValueContainer}>
                <Text style={[styles.summaryValue, { fontFamily: fonts.bold, color: colors.primary }]}>
                    {calculateTotalCalories().toFixed(0)}
                </Text>
                <Text style={[styles.summaryUnit, { fontFamily: fonts.medium, color: textColors.secondary }]}>kcal</Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 8, gap: 12}}>
                <Text style={{fontSize: 12, fontFamily: fonts.medium, color: textColors.secondary}}>P: {dailyMacros.p.toFixed(1)}g</Text>
                <Text style={{fontSize: 12, fontFamily: fonts.medium, color: textColors.secondary}}>F: {dailyMacros.f.toFixed(1)}g</Text>
                <Text style={{fontSize: 12, fontFamily: fonts.medium, color: textColors.secondary}}>C: {dailyMacros.c.toFixed(1)}g</Text>
            </View>
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
            data={trackingData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderTrackedItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="nutrition-outline" size={64} color={colors.gray[300]} />
                    <Text style={[styles.emptyText, { fontFamily: fonts.medium, color: textColors.secondary }]}>
                        {t('calorie.noEntriesForThisDay')}
                    </Text>
                    <Text style={[styles.emptySubText, { fontFamily: fonts.regular, color: textColors.disabled }]}>
                        {t('calorie.tapToTrackCalories')}
                    </Text>
                </View>
            }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.black }]}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Add Tracking Modal - Single Modal Approach */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAddModal}
      >
        {showRecipeSelector ? renderRecipeSelectorContent() : renderAddContent()}
      </Modal>

      {/* Chart Modal */}
      <Modal
        visible={showChartModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChartModal(false)}
      >
        {renderChartContent()}
      </Modal>

      {Platform.OS === 'android' && showSelectedDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onSelectedDateChange}
          />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    paddingTop: 0,
    marginTop: -30, // Pull up slightly more
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 16,
  },
  summaryContainer: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  summaryValue: {
    fontSize: 36,
    marginRight: 4,
  },
  summaryUnit: {
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  cardThumbnailPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalDone: {
    fontSize: 16,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  dateInputRow: {
    alignItems: 'flex-start',
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  recipeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recipeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeItemImage: {
      width: 40, 
      height: 40, 
      borderRadius: 6, 
      marginRight: 12,
      backgroundColor: '#eee'
  },
  recipeItemImagePlaceholder: {
      width: 40, 
      height: 40, 
      borderRadius: 6, 
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  recipeItemText: {
    fontSize: 16,
    marginBottom: 2,
  },
  recipeItemCal: {
      fontSize: 12,
  },
  infoBox: {
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
  },
  datePickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  datePickerContainer: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
  },
  datePickerHeader: {
      alignItems: 'flex-end',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  },
});

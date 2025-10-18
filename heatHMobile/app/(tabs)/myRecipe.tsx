import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { apiClient } from '../../services/apiClient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { recipeService } from '../../services/recipeService';
import RecipeDetail from '../recipeDetail/recipeDetail';


type RecipeItem = {
  id: string | number;
  title: string;
  photo?: string;
  image?: string; // fallback
  instructions?: string[]; // might be array of strings
  ingredients?: Array<string | { name: string; amount?: string; quantity?: number }>;
  tag?: string;
  type?: string;
  totalCalorie?: number;
  price?: number;
};

type IngredientForm = { name: string; amount: string };

export default function MyRecipeScreen() {
  const { colors, textColors, fonts, lineHeights } = useThemeColors();
  const router = useRouter();

  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [openForm, setOpenForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [tag, setTag] = useState('');
  const [price, setPrice] = useState<string>('');
  const [instructions, setInstructions] = useState<string[]>([]);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [ingredients, setIngredients] = useState<IngredientForm[]>([]);
  const [curIngName, setCurIngName] = useState('');
  const [curIngAmt, setCurIngAmt] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setType('');
    setTag('');
    setPrice('');
    setInstructions([]);
    setCurrentInstruction('');
    setIngredients([]);
    setCurIngName('');
    setCurIngAmt('');
    setPhotoBase64('');
    setImagePreview('');
  }, []);

  // Load my recipes using recipeService
  const fetchMyRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAllRecipes();
      setRecipes((data as any[]) || []);
    } catch (e: any) {
      setErrorMsg('Failed to load recipes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRecipes();
  }, [fetchMyRecipes]);

  const openCreateForm = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEditForm = (r: RecipeItem) => {
    setIsEditing(true);
    setEditingId(r.id);
    setTitle(r.title || '');
    setType(r.type || '');
    setTag(r.tag || '');
    setPrice(String(r.price ?? ''));
    // instructions might be string[] or missing
    setInstructions(Array.isArray(r.instructions) ? r.instructions : []);
    setImagePreview(r.photo || r.image || '');
    // parse ingredients: could be ["Flour: 2 cups"] or [{name, amount/quantity}]
    const parsed: IngredientForm[] = (r.ingredients || []).map((it: any) => {
      if (typeof it === 'string') {
        const [n, a] = it.split(':');
        return { name: (n || '').trim(), amount: (a || '').trim() };
      }
      return { name: it.name || '', amount: String(it.amount ?? it.quantity ?? '') };
    });
    setIngredients(parsed);
    setOpenForm(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need photo library permission to select an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      if (asset.base64) {
        const mime = asset.type === 'image' ? 'image/jpeg' : 'image/*';
        const uri = `data:${mime};base64,${asset.base64}`;
        setPhotoBase64(uri);
        setImagePreview(asset.uri || uri);
      } else if (asset.uri) {
        setImagePreview(asset.uri);
      }
    }
  };

  const addInstruction = () => {
    if (currentInstruction.trim().length === 0) return;
    setInstructions((prev) => [...prev, currentInstruction.trim()]);
    setCurrentInstruction('');
  };

  const removeInstruction = (idx: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addIngredient = () => {
    if (!curIngName.trim() || !curIngAmt.trim()) return;
    setIngredients((prev) => [...prev, { name: curIngName.trim(), amount: curIngAmt.trim() }]);
    setCurIngName('');
    setCurIngAmt('');
  };

  const removeIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const isFormComplete = useMemo(() => {
    return title.trim() && type.trim() && tag.trim() && instructions.length > 0 && ingredients.length > 0 && price !== '';
  }, [title, type, tag, instructions.length, ingredients.length, price]);

  const toApiIngredients = () =>
    ingredients.map((i) => ({
      name: i.name,
      quantity: Number(i.amount) || 0,
    }));

  const handleSubmit = async () => {
    if (!isFormComplete) return;
    setSubmitting(true);
    const body = {
      title,
      instructions,
      ingredients: toApiIngredients(),
      tag,
      type,
      photo: photoBase64 || imagePreview || 'https://picsum.photos/seed/default/300/300',
      totalCalorie: 0,
      price: Number(price),
    };
    try {
      if (isEditing && editingId != null) {
        // No update helper in recipeService; keep direct call
        await apiClient.put(`/recipe/update?recipeId=${editingId}`, body);
      } else {
        await recipeService.createRecipe(body);
      }
      setOpenForm(false);
      resetForm();
      await fetchMyRecipes();
    } catch (e: any) {
      Alert.alert('Error', isEditing ? 'Failed to update recipe.' : 'Failed to create recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: string | number) => {
    Alert.alert('Delete Recipe', 'Are you sure you want to delete this recipe?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await recipeService.deleteRecipe(Number(id));
            await fetchMyRecipes();
          } catch {
            Alert.alert('Error', 'Failed to delete recipe.');
          }
        },
      },
    ]);
  };

  const openDetail = (id: string | number) => {
    router.push({ pathname: '/recipeDetail/recipeDetail', params: { recipeId: String(id) } });
  };

  const renderCard = ({ item }: { item: RecipeItem }) => {
    const cover = item.photo || item.image;
    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: colors.backgroundPaper }]} onPress={() => openDetail(item.id)} onLongPress={() => openItemMenu(item)}>
        <View style={[styles.imageWrap, { backgroundColor: colors.gray[100] }]}>
          {cover ? (
            <Image source={{ uri: cover }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={[styles.placeholderText, { color: colors.gray[400] }]}>No Image</Text>
            </View>
          )}
        </View>
        <Text numberOfLines={1} style={[styles.cardTitle, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>
          {item.title}
        </Text>
        {Array.isArray(item.instructions) && item.instructions.length > 0 ? (
          <Text numberOfLines={1} style={[styles.cardSubtitle, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>
            {item.instructions[0]}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const openItemMenu = (item: RecipeItem) => {
    Alert.alert(item.title, 'What do you want to do?', [
      { text: 'View', onPress: () => openDetail(item.id) },
      { text: 'Edit', onPress: () => openEditForm(item) },
      { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(item.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: textColors.secondary, marginTop: 8, fontFamily: fonts.regular, lineHeight: lineHeights.base }}>Loading recipes...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {errorMsg ? <Text style={[styles.error, { color: colors.error }]}>{errorMsg}</Text> : null}

      {recipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>My Recipes</Text>
          <Text style={[styles.emptySub, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>Create your first recipe.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={recipes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openCreateForm} activeOpacity={0.9}>
        <Text style={[styles.fabPlus, { color: colors.white, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>＋</Text>
      </TouchableOpacity>

      <Modal visible={openForm} transparent animationType="slide" onRequestClose={() => !submitting && setOpenForm(false)}>
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: colors.white }]}>
              <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>{isEditing ? 'Edit Recipe' : 'Create New Recipe'}</Text>

                <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Title"
                  style={[styles.input, { backgroundColor: colors.gray[50], borderColor: colors.gray[300], color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
                  editable={!submitting}
                />

                <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Type</Text>
                <TextInput
                  value={type}
                  onChangeText={setType}
                  placeholder="e.g. breakfast, lunch"
                  style={[styles.input, { backgroundColor: colors.gray[50], borderColor: colors.gray[300], color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
                  editable={!submitting}
                />

                <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Tag</Text>
                <TextInput value={tag} onChangeText={setTag} placeholder="e.g. vegetarian" style={[styles.input, { backgroundColor: colors.gray[50], borderColor: colors.gray[300], color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]} editable={!submitting} />

                <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Price</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="e.g. 10"
                  style={[styles.input, { backgroundColor: colors.gray[50], borderColor: colors.gray[300], color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
                  editable={!submitting}
                />

                <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Photo</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity style={[styles.pickBtn, { backgroundColor: colors.primary + '20' }]} onPress={handlePickImage} disabled={submitting}>
                    <Text style={[styles.pickBtnText, { color: colors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Pick Image</Text>
                  </TouchableOpacity>
                  {imagePreview ? <Image source={{ uri: imagePreview }} style={{ width: 56, height: 56, borderRadius: 8 }} /> : null}
                </View>

                <Text style={[styles.label, { marginTop: 16, color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Instruction</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    value={currentInstruction}
                    onChangeText={setCurrentInstruction}
                    placeholder="Type an instruction and tap Add"
                    style={[styles.input, { flex: 1, backgroundColor: colors.gray[50], borderColor: colors.gray[300], color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
                    editable={!submitting}
                    onSubmitEditing={addInstruction}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]} onPress={addInstruction} disabled={!currentInstruction || submitting}>
                    <Text style={[styles.smallBtnText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Add</Text>
                  </TouchableOpacity>
                </View>
                {instructions.length === 0 ? (
                  <Text style={[styles.muted, { color: textColors.hint, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>No instructions added yet</Text>
                ) : (
                  <View style={styles.chipsWrap}>
                    {instructions.map((inst, idx) => (
                      <TouchableOpacity key={`${inst}-${idx}`} style={[styles.chip, { backgroundColor: colors.primary + '20' }]} onPress={() => removeInstruction(idx)}>
                        <Text style={[styles.chipText, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>{`${idx + 1}. ${inst}`}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={[styles.label, { marginTop: 16, color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Ingredient</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    value={curIngName}
                    onChangeText={setCurIngName}
                    placeholder="Name"
                    style={[styles.input, { flex: 1, backgroundColor: colors.gray[50], borderColor: colors.gray[300], color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
                    editable={!submitting}
                  />
                  <TextInput
                    value={curIngAmt}
                    onChangeText={setCurIngAmt}
                    placeholder="Amount"
                    style={[styles.input, { flex: 1, backgroundColor: colors.gray[50], borderColor: colors.gray[300], color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
                    editable={!submitting}
                    onSubmitEditing={addIngredient}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]} onPress={addIngredient} disabled={!curIngName || !curIngAmt || submitting}>
                    <Text style={[styles.smallBtnText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Add</Text>
                  </TouchableOpacity>
                </View>
                {ingredients.length === 0 ? (
                  <Text style={[styles.muted, { color: textColors.hint, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>No ingredients added yet</Text>
                ) : (
                  <View style={styles.chipsWrap}>
                    {ingredients.map((ing, idx) => (
                      <TouchableOpacity key={`${ing.name}-${idx}`} style={[styles.chip, { backgroundColor: colors.primary + '20' }]} onPress={() => removeIngredient(idx)}>
                        <Text style={[styles.chipText, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.sm }]}>{`${igName(ing)}: ${ing.amount}`}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={{ height: 12 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.gray[200] }]}
                    onPress={() => {
                      if (!submitting) {
                        setOpenForm(false);
                        resetForm();
                      }
                    }}
                    disabled={submitting}
                  >
                    <Text style={[styles.actionBtnText, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: isFormComplete ? colors.primary : colors.gray[400] }]}
                    onPress={handleSubmit}
                    disabled={!isFormComplete || submitting}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>{submitting ? 'Submitting...' : isEditing ? 'Update' : 'Create'}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const igName = (i: IngredientForm) => (i.name?.length ? i.name : 'Item');

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { padding: 12, textAlign: 'center' },
  list: { padding: 12, paddingBottom: 96, gap: 12 },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  imageWrap: { width: '100%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { /* Dynamic styling applied in component */ },
  cardTitle: { marginTop: 8, fontWeight: '700' },
  cardSubtitle: { marginTop: 2, fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySub: { marginTop: 6 },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  fabPlus: { fontSize: 28, lineHeight: 28, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', padding: 16, justifyContent: 'flex-end' },
  modalCard: {
    borderRadius: 16,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  label: { marginTop: 8, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  pickBtnText: { fontWeight: '700' },
  smallBtn: {
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: { fontWeight: '700' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  muted: { marginTop: 6 },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  actionBtnText: { fontWeight: '700' },
});


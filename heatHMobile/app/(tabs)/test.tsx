import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { feedService } from '@/services/feedService';
import { interestFormService } from '@/services/interestFormService';
import { recipeService } from '@/services/recipeService';

export default function TestScreen() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commentIdInput, setCommentIdInput] = useState('5');
  const [deleteRecipeModalVisible, setDeleteRecipeModalVisible] = useState(false);
  const [recipeIdInput, setRecipeIdInput] = useState('1');

  // FeedService methods START ---------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------
  // RecipeService methods START --------------------------------------------------------------------
  const handleCreateRecipe = async () => {
    try {
      console.log('Creating recipe...');
      // Small base64 encoded 1x1 red pixel image for testing
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
      
      const payload = {
        title: 'Test Recipe from Mobile',
        instructions: ['Step 1: Prepare ingredients', 'Step 2: Cook', 'Step 3: Serve'],
        ingredients: [
          { name: 'Ingredient 1', quantity: 100 },
          { name: 'Ingredient 2', quantity: 200 },
          { name: 'Ingredient 3', quantity: 150 }
        ],
        tag: 'test',
        type: 'dinner',
        photo: testImageBase64,
        totalCalorie: 500,
        price: 25
      };
      
      const data = await recipeService.createRecipe(payload);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Create recipe response:', jsonString);
      
      // Format the display message
      const displayMessage = `Successfully created recipe!\n\nTitle: ${payload.title}\nType: ${payload.type}\nTag: ${payload.tag}\nCalories: ${payload.totalCalorie}\nPrice: $${payload.price}\nIngredients: ${payload.ingredients.length}\nInstructions: ${payload.instructions.length} steps\n\nResponse:\n${jsonString}`;
      
      Alert.alert(
        'Recipe Created', 
        displayMessage,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create recipe';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleGetRecipe = async () => {
    try {
      console.log('Fetching recipe with ID 1...');
      const data = await recipeService.getRecipe(1);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Get recipe response:', jsonString);
      Alert.alert(
        'Recipe Data', 
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error fetching recipe:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch recipe';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleGetAllRecipes = async () => {
    try {
      console.log('Fetching all recipes...');
      const data = await recipeService.getAllRecipes();
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Get all recipes response:', jsonString);
      Alert.alert(
        'All Recipes', 
        `Returned ${Array.isArray(data) ? data.length : 0} recipes\n\n${jsonString}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error fetching all recipes:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch all recipes';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleDeleteRecipe = async () => {
    const recipeId = parseInt(recipeIdInput);
    
    if (isNaN(recipeId) || recipeId <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid recipe ID (positive number)');
      return;
    }

    setDeleteRecipeModalVisible(false);
    
    try {
      console.log(`Deleting recipe ${recipeId}...`);
      const data = await recipeService.deleteRecipe(recipeId);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Delete recipe response:', jsonString);
      Alert.alert(
        'Recipe Deleted', 
        `Successfully deleted recipe ${recipeId}\n\n${jsonString}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert(
          'Recipe Not Available',
          `Recipe ID ${recipeId} is not available or is not yours.`,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete recipe';
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleSaveRecipe = async () => {
    try {
      console.log('Saving recipe with ID 4...');
      const data = await recipeService.saveRecipe(4);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Save recipe response:', jsonString);
      Alert.alert(
        'Recipe Saved', 
        `Successfully saved recipe 4\n\n${jsonString}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      // Handle 403 error - recipe is already saved
      if (error.response?.status === 403) {
        Alert.alert(
          'Already Saved',
          'This recipe is already saved. You cannot save it again.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        console.error('Error saving recipe:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to save recipe';
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleUnsaveRecipe = async () => {
    try {
      console.log('Unsaving recipe with ID 4...');
      const data = await recipeService.unsaveRecipe(4);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Unsave recipe response:', jsonString);
      Alert.alert(
        'Recipe Unsaved', 
        `Successfully unsaved recipe 4\n\n${jsonString}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      // Handle 403 error - recipe is not saved
      if (error.response?.status === 403) {
        Alert.alert(
          'Not Saved',
          'This recipe is not saved. You cannot unsave it.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        console.error('Error unsaving recipe:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to unsave recipe';
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleGetSavedRecipes = async () => {
    try {
      console.log('Fetching saved recipes...');
      const data = await recipeService.getSavedRecipes();
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Get saved recipes response:', jsonString);
      Alert.alert(
        'Saved Recipes', 
        `Returned ${Array.isArray(data) ? data.length : 0} saved recipes\n\n${jsonString}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error fetching saved recipes:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch saved recipes';
      Alert.alert('Error', errorMsg);
    }
  };
  // RecipeService methods END ----------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Test Page</Text>
        
        {/* Feed Service Section */}
        <View style={styles.section}>
          
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={() => setDeleteModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>delete-comment (Feed ID: 12)</Text>
          </TouchableOpacity>
        </View>

        {/* Interest Form Service Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Interest Form Service</Text>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.button}
            onPress={handleCheckFirstLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>check-first-login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleCreateInterestForm}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>create-interest-form</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGetInterestForm}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>get-interest-form</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleUpdateInterestForm}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>update-interest-form</Text>
          </TouchableOpacity>
        </View>

        {/* Recipe Service Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Recipe Service</Text>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.button}
            onPress={handleCreateRecipe}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>create-recipe</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGetRecipe}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>get-recipe (ID: 1)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGetAllRecipes}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>get-all-recipes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={() => setDeleteRecipeModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>delete-recipe</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleSaveRecipe}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>save-recipe (ID: 4)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleUnsaveRecipe}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>unsave-recipe (ID: 4)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGetSavedRecipes}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>get-saved-recipes</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Comment Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Comment</Text>
              <Text style={styles.modalSubtitle}>Feed ID: 12</Text>
              
              <Text style={styles.inputLabel}>Enter Comment ID:</Text>
              <TextInput
                style={styles.input}
                value={commentIdInput}
                onChangeText={setCommentIdInput}
                keyboardType="numeric"
                placeholder="Enter comment ID"
                placeholderTextColor="#999"
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleDeleteComment}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Recipe Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteRecipeModalVisible}
          onRequestClose={() => setDeleteRecipeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Recipe</Text>
              
              <Text style={styles.inputLabel}>Enter Recipe ID:</Text>
              <TextInput
                style={styles.input}
                value={recipeIdInput}
                onChangeText={setRecipeIdInput}
                keyboardType="numeric"
                placeholder="Enter recipe ID"
                placeholderTextColor="#999"
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteRecipeModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleDeleteRecipe}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#dc3545',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


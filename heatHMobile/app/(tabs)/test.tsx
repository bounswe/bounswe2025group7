import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { feedService } from '@/services/feedService';
import { interestFormService } from '@/services/interestFormService';
import { recipeService } from '@/services/recipeService';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function TestScreen() {
  const { colors, textColors, borderColors, fonts, fontSizes, lineHeights } = useThemeColors();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commentIdInput, setCommentIdInput] = useState('5');
  const [deleteRecipeModalVisible, setDeleteRecipeModalVisible] = useState(false);
  const [recipeIdInput, setRecipeIdInput] = useState('1');

  // Helper function for button text styling
  const getButtonTextStyle = () => ({
    color: colors.primaryContrast,
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
  });

  // Helper function for button styling
  const getButtonStyle = (isDelete = false) => ({
    backgroundColor: isDelete ? colors.error : colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  });

  // FeedService methods START ---------------------------------------------------------------------
  const handleFeedByUser = async () => {
    try {
      console.log('Fetching feed by user...');
      const data = await feedService.getFeedByUser();
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Feed by user response:', jsonString);
      Alert.alert(
        'Feed Data',
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error fetching feed by user:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch feed';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleCreateFeed = async () => {
    try {
      console.log('Creating feed...');
      const payload = {
        type: 'TEXT',
        text: 'This is a test post from mobile app'
      };

      const data = await feedService.createFeed(payload);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Create feed response:', jsonString);
      Alert.alert(
        'Feed Created',
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error creating feed:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create feed';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleGetRecentFeeds = async (pageNumber: number = 0) => {
    try {
      console.log(`Fetching recent feeds for page ${pageNumber}...`);
      const data = await feedService.getRecentFeeds(pageNumber);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Recent feeds response:', jsonString);
      Alert.alert(
        `Recent Feeds - Page ${pageNumber}`,
        `Returned ${Array.isArray(data) ? data.length : 0} feeds\n\n${jsonString}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error fetching recent feeds:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch recent feeds';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleLikeFeed = async () => {
    try {
      console.log('Liking feed with ID 1...');
      const data = await feedService.likeFeed(1);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Like feed response:', jsonString);
      Alert.alert(
        'Feed Liked',
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      // Handle 403 error - feed is already liked
      if (error.response?.status === 403) {
        Alert.alert(
          'Already Liked',
          'This feed is already liked. You cannot like it again.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        console.error('Error liking feed:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to like feed';
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleUnlikeFeed = async () => {
    try {
      console.log('Unliking feed with ID 1...');
      const data = await feedService.unlikeFeed(1);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Unlike feed response:', jsonString);
      Alert.alert(
        'Feed Unliked',
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      // Handle 403 error - feed is not liked
      if (error.response?.status === 403) {
        Alert.alert(
          'Not Liked',
          'This feed is not liked. You cannot unlike it.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        console.error('Error unliking feed:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to unlike feed';
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleGetFeedOtherUser = async () => {
    try {
      console.log('Fetching feed for other user with ID 1...');
      const data = await feedService.getFeedOtherUser(1);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Feed other user response:', jsonString);
      Alert.alert(
        'Other User Feed',
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error fetching other user feed:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch other user feed';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleCommentFeed = async () => {
    try {
      console.log('Commenting on feed with ID 12...');
      const data = await feedService.commentFeed(12, 'This is a test comment');
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Comment feed response:', jsonString);
      Alert.alert(
        'Comment Added',
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error commenting on feed:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to comment on feed';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleGetFeedComments = async () => {
    try {
      console.log('Fetching comments for feed with ID 12...');
      const data = await feedService.getFeedComments(12);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Get feed comments response:', jsonString);
      Alert.alert(
        'Feed Comments',
        `Returned ${Array.isArray(data) ? data.length : 0} comments\n\n${jsonString}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error fetching feed comments:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch feed comments';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleDeleteComment = async () => {
    const commentId = parseInt(commentIdInput);

    if (isNaN(commentId) || commentId <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid comment ID (positive number)');
      return;
    }

    setDeleteModalVisible(false);

    try {
      console.log(`Deleting comment ${commentId} from feed 12...`);
      const data = await feedService.deleteComment(12, commentId);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Delete comment response:', jsonString);
      Alert.alert(
        'Comment Deleted',
        `Successfully deleted comment ${commentId} from feed 12\n\n${jsonString}`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete comment';
      Alert.alert('Error', errorMsg);
    }
  };
  // FeedService methods END ------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------------------
  // InterestFormService methods START --------------------------------------------------------------
  const handleCheckFirstLogin = async () => {
    try {
      console.log('Checking first login...');
      const isFirstLogin = await interestFormService.checkFirstLogin();
      console.log('Check first login responsdsadasdsae:', isFirstLogin);
      const message = isFirstLogin
        ? 'This is your first login - you should fill out the interest form'
        : 'Not your first login - interest form already completed';
      console.log('Check first login response:', isFirstLogin);
      Alert.alert(
        'First Login Check',
        message,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error checking first login:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to check first login';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleCreateInterestForm = async () => {
    Alert.alert(
      'Not Testable',
      'This endpoint cannot be tested because each user can only have a single interest form. If you already have an interest form, this will fail. Use "update-interest-form" instead.',
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handleGetInterestForm = async () => {
    try {
      console.log('Fetching interest form...');
      const data = await interestFormService.getInterestForm();
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Get interest form response:', jsonString);
      Alert.alert(
        'Interest Form Data',
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error fetching interest form:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch interest form';
      Alert.alert('Error', errorMsg);
    }
  };

  const handleUpdateInterestForm = async () => {
    try {
      console.log('Updating interest form...');
      // Small base64 encoded 1x1 blue pixel image for testing (different from create)
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==';

      const payload = {
        name: 'Jane',
        surname: 'Smith',
        dateOfBirth: '1992-05-20',
        height: 165,
        weight: 60,
        gender: 'Female',
        profilePhoto: testImageBase64
      };

      const data = await interestFormService.updateInterestForm(payload);
      const jsonString = JSON.stringify(data, null, 2);
      console.log('Update interest form response:', jsonString);
      Alert.alert(
        'Interest Form Updated',
        jsonString,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error updating interest form:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update interest form';
      Alert.alert('Error', errorMsg);
    }
  };
  // InterestFormService methods END ----------------------------------------------------------------

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
    <ScrollView style={[styles.scrollView, { backgroundColor: colors.backgroundPaper }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColors.primary, fontFamily: fonts.bold, fontSize: fontSizes['3xl'], lineHeight: lineHeights['3xl'] }]}>Test Page</Text>
        {/* Feed Service Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionHeader, { color: textColors.primary, fontFamily: fonts.bold, fontSize: fontSizes.xl, lineHeight: lineHeights.xl }]}>Feed Service</Text>
          <View style={[styles.divider, { backgroundColor: borderColors.light }]} />
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleFeedByUser}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>feed-by-user</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={() => handleGetRecentFeeds(0)}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-recent-feeds (Page: 0)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={() => handleGetRecentFeeds(1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-recent-feeds (Page: 1)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={() => handleGetRecentFeeds(2)}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-recent-feeds (Page: 2)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleCreateFeed}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>create-feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleLikeFeed}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>like-feed (ID: 1)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleUnlikeFeed}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>unlike-feed (ID: 1)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleGetFeedOtherUser}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-feed-other-user (User ID: 1)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleCommentFeed}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>comment-feed (ID: 12, Message: "This is a test comment")</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleGetFeedComments}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-feed-comments (Feed ID: 12)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle(true)}
            onPress={() => setDeleteModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>delete-comment (Feed ID: 12)</Text>
          </TouchableOpacity>
        </View>

        {/* Interest Form Service Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionHeader, { color: textColors.primary, fontFamily: fonts.bold, fontSize: fontSizes.xl, lineHeight: lineHeights.xl }]}>Interest Form Service</Text>
          <View style={[styles.divider, { backgroundColor: borderColors.light }]} />
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleCheckFirstLogin}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>check-first-login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleCreateInterestForm}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>create-interest-form</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleGetInterestForm}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-interest-form</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleUpdateInterestForm}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>update-interest-form</Text>
          </TouchableOpacity>
        </View>

        {/* Recipe Service Section */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionHeader, { color: textColors.primary, fontFamily: fonts.bold, fontSize: fontSizes.xl, lineHeight: lineHeights.xl }]}>Recipe Service</Text>
          <View style={[styles.divider, { backgroundColor: borderColors.light }]} />
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleCreateRecipe}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>create-recipe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleGetRecipe}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-recipe (ID: 1)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleGetAllRecipes}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-all-recipes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle(true)}
            onPress={() => setDeleteRecipeModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>delete-recipe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleSaveRecipe}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>save-recipe (ID: 4)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleUnsaveRecipe}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>unsave-recipe (ID: 4)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={handleGetSavedRecipes}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle()]}>get-saved-recipes</Text>
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
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: textColors.primary, fontFamily: fonts.bold, fontSize: fontSizes['2xl'], lineHeight: lineHeights['2xl'] }]}>Delete Comment</Text>
              <Text style={[styles.modalSubtitle, { color: textColors.secondary, fontFamily: fonts.regular, fontSize: fontSizes.base, lineHeight: lineHeights.base }]}>Feed ID: 12</Text>

              <Text style={[styles.inputLabel, { color: textColors.primary, fontFamily: fonts.medium, fontSize: fontSizes.base, lineHeight: lineHeights.base }]}>Enter Comment ID:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundPaper, borderColor: colors.primary, color: textColors.primary, fontFamily: fonts.regular, fontSize: fontSizes.lg, lineHeight: lineHeights.lg }]}
                value={commentIdInput}
                onChangeText={setCommentIdInput}
                keyboardType="numeric"
                placeholder="Enter comment ID"
                placeholderTextColor={colors.gray[400]}
                autoFocus={true}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={() => setDeleteModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalButtonText, { color: colors.primaryContrast, fontFamily: fonts.medium, fontSize: fontSizes.base, lineHeight: lineHeights.base }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.error }]}
                  onPress={handleDeleteComment}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalButtonText, { color: colors.primaryContrast, fontFamily: fonts.medium, fontSize: fontSizes.base, lineHeight: lineHeights.base }]}>Delete</Text>
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
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: textColors.primary, fontFamily: fonts.bold, fontSize: fontSizes['2xl'], lineHeight: lineHeights['2xl'] }]}>Delete Recipe</Text>

              <Text style={[styles.inputLabel, { color: textColors.primary, fontFamily: fonts.medium, fontSize: fontSizes.base, lineHeight: lineHeights.base }]}>Enter Recipe ID:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundPaper, borderColor: colors.primary, color: textColors.primary, fontFamily: fonts.regular, fontSize: fontSizes.lg, lineHeight: lineHeights.lg }]}
                value={recipeIdInput}
                onChangeText={setRecipeIdInput}
                keyboardType="numeric"
                placeholder="Enter recipe ID"
                placeholderTextColor={colors.gray[400]}
                autoFocus={true}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={() => setDeleteRecipeModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalButtonText, { color: colors.primaryContrast, fontFamily: fonts.medium, fontSize: fontSizes.base, lineHeight: lineHeights.base }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.error }]}
                  onPress={handleDeleteRecipe}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalButtonText, { color: colors.primaryContrast, fontFamily: fonts.medium, fontSize: fontSizes.base, lineHeight: lineHeights.base }]}>Delete</Text>
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
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
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
    marginBottom: 10,
  },
  divider: {
    height: 1,
    marginBottom: 15,
  },
  button: {
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
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    // Will be set dynamically
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
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
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


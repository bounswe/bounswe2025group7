import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { feedService } from '@/services/feedService';
import { interestFormService } from '@/services/interestFormService';

export default function TestScreen() {
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

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Test Page</Text>
        
        {/* Feed Service Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Feed Service</Text>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.button}
            onPress={handleFeedByUser}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>feed-by-user</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleCreateFeed}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>create-feed</Text>
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
});


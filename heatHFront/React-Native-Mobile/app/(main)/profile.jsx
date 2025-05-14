// app/main/planner.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import interestFormService from '../../services/interestFormService';
import defaultAvatar from '../../assets/images/auth/avatar_default.jpg';

const ProfileScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    gender: '',
    profilePhoto: null,
    userId: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const data = await interestFormService.getInterestForm();
        setFormData({
          name: data.name || '',
          surname: data.surname || '',
          dateOfBirth: data.dateOfBirth || '',
          height: String(data.height || ''),
          weight: String(data.weight || ''),
          gender: data.gender || '',
          profilePhoto: data.profilePhoto || null,
          userId: data.user?.id || null,
        });
        console.log('✅ Form Data:', data);
      } catch (error) {
        console.error('❌ Failed to fetch interest form:', error);
      }
    };

    fetchFormData();
  }, []);

  const handleUpdate = async () => {
    try {
      const payload = {
        ...formData,
        height: parseInt(formData.height),
        weight: parseFloat(formData.weight),
      };
      await interestFormService.updateInterestForm(payload);
      Alert.alert('Success', 'Profile information updated.');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Failed to update interest form:', error);
      Alert.alert('Error', 'Failed to update profile info.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        {/* Image and Name Container */}
        <View style={styles.imageNameContainer}>
          <Image style={styles.avatarImage} source={defaultAvatar} />
          <Text style={styles.userName}>{formData.name} {formData.surname}</Text>
        </View>

        {/* Info Fields */}
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.infoTitle}>Weight:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>{formData.weight}</Text>
            )}
          </View>
          <View>
            <Text style={styles.infoTitle}>Height:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.height}
                onChangeText={(text) => setFormData({ ...formData, height: text })}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>{formData.height}</Text>
            )}
          </View>
          <View>
            <Text style={styles.infoTitle}>Gender:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.gender}
                onChangeText={(text) => setFormData({ ...formData, gender: text })}
              />
            ) : (
              <Text style={styles.infoValue}>{formData.gender}</Text>
            )}
          </View>
          <View>
            <Text style={styles.infoTitle}>Date of Birth:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
              />
            ) : (
              <Text style={styles.infoValue}>{formData.dateOfBirth}</Text>
            )}
          </View>
        </View>

        {/* Edit / Submit Button */}
        <Pressable
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleUpdate();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text style={styles.buttonText}>{isEditing ? 'Submit Changes' : 'Edit Profile Info'}</Text>
        </Pressable>

        {/* Profile Feeds Info */}
        <View style={styles.feedsContainer}>
          <Text style={styles.feedsText}>Profile Feeds Info will go here.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  profileContainer: {
    width: '85%',
    padding: 12,
    marginTop: '15%',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  imageNameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 130,
    width: '100%',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.5,
    marginTop: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  infoContainer: {
    flexDirection: 'column',
    gap: 12,
    paddingVertical: '10%',
    paddingHorizontal: 10,
    borderTopColor: 'grey',
    borderBottomColor: 'grey',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  infoValue: {
    color: 'black',
    fontSize: 15,
  },
  infoTitle: {
    color: '#565757',
    fontSize: 15,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 15,
    backgroundColor: 'white',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  feedsContainer: {
    marginTop: 20,
  },
  feedsText: {
    fontSize: 14,
    color: '#666',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 4,
    resizeMode: 'cover',
    marginBottom: 12,
  },
});

export default ProfileScreen;

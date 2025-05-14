// app/main/planner.jsx
import React, {useState, useEffect} from 'react';
import { View, Image, Text, StyleSheet} from 'react-native';
// js backend api
import interestFormService from '../../services/interestFormService'
import defaultAvatar from '../../assets/images/auth/avatar_default.jpg'
export default ProfileScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    gender: '',
    profilePhoto: null,
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const data = await interestFormService.getInterestForm();
        setFormData({
          name: data.name || '',
          surname: data.surname || '',
          dateOfBirth: data.dateOfBirth || '',
          height: parseInt(data.height) || 0,
          weight: parseFloat(data.weight) || 0.0,
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

  return (
    <View style={styles.container}>
      {/* Info Container */}
      <View style={styles.profileContainer}>
        
        {/* Image and Name Container */}
        <View style={styles.imageNameContainer}>
          {/* Placeholder for profile image */}
          <Image style = {styles.avatarImage} source = {defaultAvatar}/>
          
          {/* User Name (placeholder) */}
          <Text style={styles.userName}>John Doe</Text>
        </View>

        {/* Weight, Height, Gender, Date of Birth Container */}
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.infoTitle}>Weight:</Text>
            <Text style={styles.infoValue}>{formData.weight}</Text>
          </View>
          <View>
            <Text style={styles.infoTitle}>Height:</Text>
            <Text style={styles.infoValue}>{formData.height}</Text>
          </View>
          <View>
            <Text style={styles.infoTitle}>Gender:</Text>
            <Text style={styles.infoValue}>{formData.gender}</Text>
          </View>
          <View>
            <Text style={styles.infoTitle}>Date of Birth:</Text>
            <Text style={styles.infoValue}>{formData.dateOfBirth}</Text>
          </View>
        </View>

        {/* Profile Feeds Info (can be used to add more profile information) */}
        <View style={styles.feedsContainer}>
          {/* Add profile feed content here */}
          <Text style={styles.feedsText}>Profile Feeds Info will go here.</Text>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  backgroundColor: '#FFFFFF',
}
,
  profileContainer: {
    width: '85%',
    padding: 12,
    height: '70%',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
     
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,

    // Android shadow
    elevation: 5,
  },
  imageNameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '35%',
    width: '100%'
    
  },
  userName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000000',
  letterSpacing: 0.5,
  marginTop: 8,
  textAlign: 'center',

  // Optional subtle shadow for depth
  textShadowColor: 'rgba(0, 0, 0, 0.1)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 1,
  },

  infoContainer: {
    flexDirection: 'row',
    paddingVertical: '10%',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: 'grey',
    borderBottomColor: 'grey',
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  feedContainer: {
    height: '35%'
  },
  infoValue: {
    color: 'black',
    fontSize: 15
  },
  infoTitle: {
    color: '#565757',
    fontSize: 15
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    // Android shadow
    elevation: 4,
    resizeMode: 'cover',
    marginBottom: 12
  }

});


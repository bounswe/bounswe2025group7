import React, { useState } from 'react';
import { ImageBackground, View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet } from 'react-native';

// picker libs
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker'; // Replace expo-image-picker
// js backend api
import interestFormService from '../../services/interestFormService'
// Router to move either to profile
import { useRouter } from 'expo-router';
// my components
import Spacer from '../../components/general/Spacer'

// images
import backgroundImage from '../../assets/images/forms/b2.jpg'

const InterestForm = ({ userId, onSubmit = async (formData) => { 
      try {
      const result = await interestFormService.createInterestForm(formData);
      console.log('✅ Form submitted successfully:', result);

      // navigate to profile
      router.replace('profile');
    } catch (error) {
      console.error('❌ Error submitting form:', error);

      // Show error to user, if needed
      // Alert.alert("Submission failed", "Please try again later.");
    }
  }
  }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  const pickerBorderColor = gender ? '#4CAF50' : '#d1d3d4'; // Change color based on selection

  const handleImagePick = () => {
    launchImageLibrary(
      {
        mediaType: 'photo', // Picking images
        includeBase64: false, // Do not include base64
        quality: 1, // Set quality
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          setProfilePhoto(response.assets[0].uri); // Using URI from the response
        }
      }
    );
  };

  const handleSubmit = () => {
    const formData = {
      name,
      surname,
      dateOfBirth,
      height: parseInt(height),
      weight: parseFloat(weight),
      gender,
      profilePhoto, // You may need to handle file uploading here
      userId,
    };
    
    onSubmit(formData); // Call the onSubmit function passed in as prop
  };

  return (
  <>
    <ImageBackground source={backgroundImage} style = {styles.background}>
      <View style={styles.container}>
        <Spacer height = '5%'/>
        <Text style={styles.title}>Interest Form</Text>

        <TextInput
            style={styles.input}
            placeholder="First Name"
            value={name}
            onChangeText={setName}
        />
        <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={surname}
            onChangeText={setSurname}
        />
        <TextInput
            style={styles.input}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
        />
        <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            value={height}
            keyboardType="numeric"
            onChangeText={setHeight}
        />
        <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={weight}
            keyboardType="numeric"
            onChangeText={setWeight}
        />
        
      <View style={{overflow: 'hidden', marginBottom: 17 }}>
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        style={{ height: 190 }} // Gives room for scrollable area
        itemStyle={{color: 'white', fontSize: 20 }} // iOS only
      >
        <Picker.Item label="Select Gender" value="" color="#aaa" />
        <Picker.Item label="Male" value="male" color="white" />
        <Picker.Item label="Female" value="female" color="white" />
        <Picker.Item label="Other" value="other" color="white" />
      </Picker>
    </View>


        
        

        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
            <Text style={styles.imagePickerText}>Pick Profile Photo</Text>
        </TouchableOpacity>
        
        {profilePhoto && (
            <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  </>
    
  );
};




const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  submitButton: {
  backgroundColor: '#007BFF', // Bootstrap-style blue
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 10
},
submitButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold'
},
  container: {
    padding: 20,
    flex: 1
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#EEF4E6', // Light color, so let's enhance it further
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Dark shadow for contrast
    textShadowOffset: { width: 1, height: 1 }, // Position of the shadow
    textShadowRadius: 5
  },
  input: {
    height: 50,
    borderColor: '#d1d3d4', // Light gray border color
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 15,
    borderRadius: 8,
    backgroundColor: '#f1f1f1', // Light background color for input
    fontSize: 16,
    color: '#333', // Dark text color for readability
  },
  inputFocused: {
    borderColor: '#4CAF50', // Green border color when focused
    backgroundColor: '#e8f5e9', // Light green background when focused
  },
  picker: {
    height: 200,
    marginBottom: 20
  },
  imagePicker: {
    backgroundColor: '#4CAF50', // Green button
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20
  },
});


export default InterestForm;

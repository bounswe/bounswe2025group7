import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Avatar,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Template from '../components/Template';
import interestFormService from '../services/interestFormService';

const Input = styled('input')({
  display: 'none',
});

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    weight: '',
    height: '',
    dateOfBirth: '',
    gender: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // On mount, fetch existing interest form to prefill fields
  useEffect(() => {
    const loadForm = async () => {
      try {
        const data = await interestFormService.getInterestForm();
        console.log('Loaded interest form:', data);
        // Format dateOfBirth for input type="date"
        const dob = data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '';
        setFormData(prev => ({
          ...prev,
          firstName: data.name || '',
          lastName: data.surname || '',
          dateOfBirth: dob,
          height: data.height != null ? data.height.toString() : '',
          weight: data.weight != null ? data.weight.toString() : '',
          gender: data.gender || prev.gender || '',
          profilePhoto: data.profilePhoto
        }));
        // Set the profile photo preview if it exists
        if (data.profilePhoto) {
          setPreviewUrl(data.profilePhoto);
        }
      } catch (err) {
        console.log('No existing interest form, proceeding blank');
        // if no form exists, do nothing
      }
    };
    loadForm();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If there's a new photo, use its base64 data, otherwise use the existing previewUrl
      const photoToSubmit = profilePhoto ? previewUrl : null;
      
      // Submit interest-form data
      await interestFormService.updateInterestForm({
        name: formData.firstName,
        surname: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        height: Number(formData.height),
        weight: Number(formData.weight),
        gender: formData.gender,
        profilePhoto: photoToSubmit, // Send null if no new photo was uploaded
      });
      // After successful submission, send user to home
      navigate('/home');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <Template>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Edit Your Profile
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
          Please provide your information to get started
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} justifyContent="center">
            {/* Profile Photo Upload */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={previewUrl}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <label htmlFor="profile-photo">
                  <Input
                    accept="image/*"
                    id="profile-photo"
                    type="file"
                    onChange={handlePhotoChange}
                  />
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'white',
                      '&:hover': { backgroundColor: 'white' },
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            {/* Name Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Physical Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                select
                value={formData.gender}
                onChange={handleChange}
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value=""></option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>

            {/* Personal Information */}
           
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Save Profile
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Template>
  );
};

export default EditProfile; 
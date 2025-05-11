import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Template from '../components/Template';
import interestFormService from '../services/interestFormService';
import { useNavigate } from 'react-router-dom';

const Input = styled('input')({
  display: 'none',
});

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch real profile data from backend
        const data = await interestFormService.getInterestForm();
        setProfileData({
          firstName: data.name,
          lastName: data.surname,
          weight: data.weight,
          height: data.height,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,      
          profilePhoto: data.profilePhoto || '',  
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  if (loading) {
    return (
      <Template>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Template>
    );
  }

  if (error) {
    return (
      <Template>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography color="error">{error}</Typography>
        </Box>
      </Template>
    );
  }

  return (
    <Template>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        {/* Profile Header with Photo and Name */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar
              src={previewUrl || profileData.profilePhoto}
              sx={{ width: 150, height: 150 }}
            />
            <label htmlFor="profile-photo-edit">
              <Input
                accept="image/*"
                id="profile-photo-edit"
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
          <Typography variant="h4" component="h1" gutterBottom>
            {profileData.firstName} {profileData.lastName}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Profile Information */}
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Weight
            </Typography>
            <Typography variant="h6" gutterBottom>
              {profileData.weight} kg
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Gender
            </Typography>
            <Typography variant="h6" gutterBottom>
              {profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Height
            </Typography>
            <Typography variant="h6" gutterBottom>
              {profileData.height} cm
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Date of Birth
            </Typography>
            <Typography variant="h6" gutterBottom>
              {new Date(profileData.dateOfBirth).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Template>
  );
};

export default Profile; 
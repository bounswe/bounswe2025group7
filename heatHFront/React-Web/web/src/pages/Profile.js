import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Template from '../components/Template';
import interestFormService from '../services/interestFormService';
import feedService from '../services/feedService';
import { useNavigate } from 'react-router-dom';

const Input = styled('input')({
  display: 'none',
});

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ⬇️ feeds state (array!) + loading flag
  const [userFeed, setUserFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const effectRan = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const controller = new AbortController();

    // fetch profile details
    const fetchProfileData = async () => {
      try {
        const data = await interestFormService.getInterestForm({
          signal: controller.signal,
        });
        setProfileData({
          firstName: data.name,
          lastName: data.surname,
          weight: data.weight,
          height: data.height,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          profilePhoto: data.profilePhoto || '',
        });
      } catch (err) {
        if (err.name !== 'AbortError') setError('Failed to load profile data');
      } finally {
        setLoadingProfile(false);
      }
    };

    // fetch current user’s feeds
    const fetchFeedByUser = async () => {
      try {
        const data = await feedService.getFeedByUser(); // ‼️ returns an array
        setUserFeed(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load feeds');
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchProfileData();
    fetchFeedByUser();
    return () => controller.abort();
  }, []);

  const handleEditProfile = () => navigate('/profile/edit');

  /* ---------------- RENDER ---------------- */
  if (loadingProfile || loadingFeed) {
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
        {/* ---------- PROFILE HEADER ---------- */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar src={previewUrl || profileData.profilePhoto} sx={{ width: 150, height: 150 }} />
            <label htmlFor="profile-photo-edit">
              <Input accept="image/*" id="profile-photo-edit" type="file" />
            </label>
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {profileData.firstName} {profileData.lastName}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* ---------- PROFILE INFO GRID ---------- */}
        <Grid container spacing={3} justifyContent="center">
          {[
            { label: 'Weight', value: `${profileData.weight} kg` },
            { label: 'Height', value: `${profileData.height} cm` },
            {
              label: 'Gender',
              value: profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1),
            },
            {
              label: 'Date of Birth',
              value: new Date(profileData.dateOfBirth).toLocaleDateString(),
            },
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={6} key={label}>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {label}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {value}
              </Typography>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" mt={3}>
              <Button variant="contained" color="primary" onClick={handleEditProfile}>
                Edit Profile
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* ---------- MY FEEDS SECTION ---------- */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom>
          My Feeds
        </Typography>

        {userFeed.length === 0 ? (
          <Typography color="textSecondary">You haven’t posted anything yet.</Typography>
        ) : (
          userFeed.map((feed) => (
            <Box
              key={feed.id}
              sx={{
                mb: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">{feed.text}</Typography>

              {feed.image && (
                <Box
                  component="img"
                  src={feed.image}
                  alt="feed media"
                  sx={{ width: '100%', mt: 1, borderRadius: 1 }}
                />
              )}

              <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="textSecondary">
                  {new Date(feed.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {feed.likeCount} {feed.likeCount === 1 ? 'like' : 'likes'}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Paper>
    </Template>
  );
};

export default Profile;

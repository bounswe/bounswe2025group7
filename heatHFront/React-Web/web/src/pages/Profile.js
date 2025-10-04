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
import { useTranslation } from 'react-i18next';
import Template from '../components/Template';
import interestFormService from '../services/interestFormService';
import feedService from '../services/feedService';
import { useNavigate } from 'react-router-dom';

const Input = styled('input')({
  display: 'none',
});

const Profile = () => {
  const { t } = useTranslation();
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
        if (err.name !== 'AbortError') setError(t('errors.genericError'));
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
        setError(t('errors.genericError'));
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
            { label: t('profile.weight'), value: `${profileData.weight} kg` },
            { label: t('profile.height'), value: `${profileData.height} cm` },
            {
              label: t('profile.gender'),
              value: profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1),
            },
            {
              label: t('profile.dateOfBirth'),
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
                {t('profile.editProfile')}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* ---------- MY FEEDS SECTION ---------- */}
        {/* ---------- MY FEEDS SECTION ---------- */}
        <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom>
            {t('home.recentActivity')}
          </Typography>

          {userFeed.length === 0 ? (
            <Typography color="textSecondary">{t('home.recentActivity')}</Typography>
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
                {/* Text Feed */}
                {feed.type === 'TEXT' && (
                  <Typography variant="body1">{feed.text}</Typography>
                )}

                {/* Image Feed */}
                {feed.type === 'IMAGE_AND_TEXT' && (
                  <>
                    {feed.image && (
                      <Box
                        component="img"
                        src={feed.image}
                        alt="feed media"
                        sx={{ width: '100%', mb: 1, borderRadius: 1 }}
                      />
                    )}
                    <Typography variant="body1">{feed.text}</Typography>
                  </>
                )}

                {/* Recipe Feed */}
                {feed.type === 'RECIPE' && feed.recipe && (
                  <>
                    <Typography variant="h6" sx={{ mb: 1 }}>{feed.recipe.title}</Typography>
                    <Box onClick={() => navigate(`/recipe/${feed.recipe.id}`)} sx={{ position:'relative', width:'100%', pt:'56.25%', overflow:'hidden', borderRadius: 1, mb: 1 }}>
                      <img 
                        src={feed.recipe.photo} 
                        alt={feed.recipe.title} 
                        style={{ 
                          position:'absolute', 
                          top:0, 
                          left:0, 
                          width:'100%', 
                          height:'100%', 
                          objectFit:'cover' 
                        }}
                      />
                    </Box>
                    {feed.text && <Typography variant="body1" sx={{ mt: 1 }}>{feed.text}</Typography>}
                  </>
                )}

                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    {new Date(feed.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {feed.likeCount} {feed.likeCount === 1 ? t('common.like') : t('common.likes')}
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

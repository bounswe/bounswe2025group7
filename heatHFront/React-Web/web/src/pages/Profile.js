import React, { useState, useEffect, useRef } from 'react';
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
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import Template from '../components/Template';
import interestFormService from '../services/interestFormService';
import { useNavigate } from 'react-router-dom';

const Input = styled('input')({
  display: 'none',
});

// Simulated static posts data; replace with API call later
const staticPosts = [
  {
    id: 1,
    text: "Check out my new recipe for Avocado Quinoa Salad!",
    image: "https://picsum.photos/seed/avocado-quinoa-salad/300/300",
    liked: false,
    saved: false,
    shared: false,
  },
  {
    id: 2,
    text: "My Homemade Pizza is finally ready to share!",
    image: "https://picsum.photos/seed/homemade-pizza/300/300",
    liked: true,
    saved: false,
    shared: false,
  },
];

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const effectRan = useRef(false);
  const navigate = useNavigate();

  // New state for posts
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    // Stop after the first real run
    if (effectRan.current) return;
    effectRan.current = true;

    const controller = new AbortController();
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
        if (err.name !== 'AbortError') {
          setError('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch profile data
    fetchProfileData();

    // Simulate fetching posts – replace with your API call
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setPosts(staticPosts);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();

    return () => controller.abort();
  }, []);

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
              />
              {/* You can add an icon button here for photo upload if needed */}
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

        {/* Divider between profile info and posts */}
        <Divider sx={{ my: 4 }} />

        
        {/* My Posts Feed */}
        <Box
          sx={{
            maxWidth: 600,
            mx: 'auto',
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            px: 2,
          }}
        >
          <Typography variant="h5" gutterBottom align="center">
            My Posts
          </Typography>
          {postsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <Typography align="center">
              No posts yet. Start sharing your recipes!
            </Typography>
          ) : (
            posts.map((post) => (
              <Card key={post.id} sx={{ width: '100%', boxShadow: 2, '&:hover': { boxShadow: 6 } }}>
                {post.image && (
                  <Box
                    onClick={() => {
                      /* Optionally, you can add a click handler to navigate to post details */
                    }}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '100%', // maintains a square aspect ratio
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover .descOverlay': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    <img
                      src={post.image}
                      alt="Post Image"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                )}
                <CardContent>
                  <Typography variant="body1">
                    {post.text}
                  </Typography>
                </CardContent>
                <CardActions disableSpacing>
                  <IconButton color={post.liked ? 'error' : 'default'}>
                    {post.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <IconButton color={post.saved ? 'primary' : 'default'}>
                    {post.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                  <IconButton color={post.shared ? 'secondary' : 'default'}>
                    {post.shared ? <ShareIcon /> : <ShareOutlinedIcon />}
                  </IconButton>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      </Paper>
    </Template>
  );
};

export default Profile;
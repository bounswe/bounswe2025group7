import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, 
  CircularProgress, Alert, Button
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import Recipe from '../models/Recipe';
import Template from '../components/Template';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 0),
  textAlign: 'center',
}));

const SavedRecipes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch saved recipes on component mount
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        
        // Call the saved recipes endpoint
        const response = await apiClient.get('/saved-recipes/get');
        const savedRecipes = response.data;
        
        // Map API response to Recipe objects
        const recipeInstances = savedRecipes.map(recipe => {
          const recipeObj = new Recipe({
            id: recipe.recipeId,
            title: recipe.title,
            photo: recipe.photo,
            // Set these properties with defaults as needed
            instructions: [], 
            totalCalory: 0,
            ingredients: [],
            tag: '',
            price: 0,
            type: '',
            healthinessScore: 0,
            easinessScore: 0,
            whoShared: null,
          });
          
          // Set saved state to true since these are saved recipes
          recipeObj.saved = true;
          recipeObj.liked = false; // Default state
          recipeObj.shared = false; // Default state
          
          return recipeObj;
        });
        
        setRecipes(recipeInstances);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch saved recipes:", err);
        setError("Failed to load saved recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedRecipes();
  }, []);

  const handleRecipeClick = (recipe) => {
    // Navigate to the recipe detail page
    navigate(`/recipe/${recipe.id}`);
  };

  const toggleSave = async (id) => {
    try {
      // Optimistic UI update - remove from list immediately
      setRecipes(prev => prev.filter(r => r.id !== id));
      
      // Call the API to unsave the recipe
      await apiClient.post('/saved-recipes/unsave', { recipeId: id });
      
    } catch (error) {
      console.error("Failed to unsave recipe:", error);
      
      // Fetch all saved recipes again to restore accurate state
      const response = await apiClient.get('/saved-recipes/get');
      const savedRecipes = response.data;
      
      // Map API response to Recipe objects
      const recipeInstances = savedRecipes.map(recipe => {
        const recipeObj = new Recipe({
          id: recipe.recipeId,
          title: recipe.title,
          photo: recipe.photo,
          instructions: [], 
          totalCalory: 0,
          ingredients: [],
          tag: '',
          price: 0,
          type: '',
          healthinessScore: 0,
          easinessScore: 0,
          whoShared: null,
        });
        
        recipeObj.saved = true;
        recipeObj.liked = false;
        recipeObj.shared = false;
        
        return recipeObj;
      });
      
      setRecipes(recipeInstances);
      
      // Show error to user
      setError("Failed to unsave recipe. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Share functionality
  const handleShare = (recipe) => {
    if (navigator.share) {
      navigator.share({
        title: recipe.getTitle(),
        text: `Check out this recipe: ${recipe.getTitle()}`,
        url: `${window.location.origin}/recipe/${recipe.id}`,
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support navigator.share
      const recipeUrl = `${window.location.origin}/recipe/${recipe.id}`;
      navigator.clipboard.writeText(recipeUrl)
        .then(() => {
          setError("Link copied to clipboard!");
          setTimeout(() => setError(null), 3000);
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
          setError("Failed to copy link. Please try again.");
          setTimeout(() => setError(null), 3000);
        });
    }
  };

  return (
    <Template>
      <Box>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Error message display */}
          {error && (
            <Alert severity={error.includes("Failed") ? "error" : "success"} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading state */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : recipes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                {t('recipes.noSavedRecipes')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                {t('recipes.noSavedRecipesMessage')}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/home')}
              >
                {t('home.browseRecipes')}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: theme.spacing(3) }}>
              {recipes.map((recipe) => (
                <Card key={recipe.id} sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}>
                  <Typography variant="h6" sx={{ 
                    m: 2, 
                    color: 'text.primary',
                    height: '40px',
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                  }}>
                    {recipe.getTitle()}
                  </Typography>
                  <Box
                    onClick={() => handleRecipeClick(recipe)}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '75%', // 4:3 aspect ratio
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover .descOverlay': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    <img
                      src={recipe.getPhoto()}
                      alt={recipe.getTitle()}
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
                  <CardActions disableSpacing sx={{ mt: 'auto', pt: 1, justifyContent: 'space-evenly' }}>
                    <IconButton
                      onClick={() => handleRecipeClick(recipe)}
                      aria-label="view recipe"
                      color="default"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      <Typography variant="caption">{t('common.view')}</Typography>
                    </IconButton>
                    <IconButton
                      onClick={() => toggleSave(recipe.id)}
                      aria-label="unsave"
                      color="primary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      <BookmarkIcon sx={{ mr: 0.5 }} />
                      <Typography variant="caption">{t('common.delete')}</Typography>
                    </IconButton>
                    <IconButton
                      onClick={() => handleShare(recipe)}
                      aria-label="share"
                      color="info"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      <ShareOutlinedIcon sx={{ mr: 0.5 }} />
                      <Typography variant="caption">{t('common.share')}</Typography>
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </Template>
  );
};

export default SavedRecipes;
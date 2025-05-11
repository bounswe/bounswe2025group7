import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, 
  CircularProgress, Alert, Button
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import Recipe from '../models/Recipe';
import Template from '../components/Template';
import { useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService'; // Import the recipe service

// Static list for initial UI rendering - will be replaced with API data
const initialRecipes = [
  { id: 1, title: 'Avocado Quinoa Salad', image: 'https://picsum.photos/seed/avocado-quinoa-salad/300/300', description: 'A refreshing blend of avocado, quinoa, and fresh vegetables', liked: false, saved: true, shared: false },
  { id: 2, title: 'Mediterranean Chickpea Bowl', image: 'https://picsum.photos/seed/mediterranean-chickpea-bowl/300/300', description: 'Protein-packed chickpeas with olives, tomatoes, and feta', liked: false, saved: true, shared: false },
  // ...other recipes
];

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 0),
  textAlign: 'center',
}));

const SavedRecipes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch saved recipes on component mount
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Convert plain objects to Recipe instances
        const recipeInstances = initialRecipes.map(recipe => {
          const recipeObj = new Recipe({
            id: recipe.id,
            title: recipe.title,
            photo: recipe.image,
            instructions: [recipe.description], // Use description as the first instruction
            totalCalory: 0,
            ingredients: [],
            tag: '',
            price: 0,
            type: '',
            healthinessScore: 0,
            easinessScore: 0,
            whoShared: null,
          });
          
          // Add the additional properties
          recipeObj.liked = recipe.liked;
          recipeObj.saved = recipe.saved;
          recipeObj.shared = recipe.shared;
          
          return recipeObj;
        });
        
        // Filter to only include saved recipes
        const savedRecipes = recipeInstances.filter(recipe => recipe.saved);
        
        setRecipes(savedRecipes);
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

  // Updated to use recipeService
  const toggleLike = async (id) => {
    try {
      // Optimistic UI update
      setRecipes(prev =>
        prev.map(r => (r.id === id ? { ...r, liked: !r.liked } : r))
      );
      
      // Get the current recipe
      const recipe = recipes.find(r => r.id === id);
      const newValue = !recipe.liked;
      
      // Call the API
      await recipeService.updateRecipeAction(id, 'like', newValue);
    } catch (error) {
      console.error("Failed to update like status:", error);
      // Revert optimistic update on error
      setRecipes(prev =>
        prev.map(r => (r.id === id ? { ...r, liked: !r.liked } : r))
      );
      // Show error to user
      setError("Failed to update like status. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Updated to use recipeService
  const toggleSave = async (id) => {
    try {
      // Optimistic UI update
      setRecipes(prev =>
        prev.map(r => (r.id === id ? { ...r, saved: !r.saved } : r))
      );
      
      // Get the current recipe
      const recipe = recipes.find(r => r.id === id);
      const newValue = !recipe.saved;
      
      // Call the API
      await recipeService.updateRecipeAction(id, 'save', newValue);
      
      // If unsaved, remove from the list after a short delay
      if (!newValue) {
        setTimeout(() => {
          setRecipes(prev => prev.filter(r => r.id !== id));
        }, 300);
      }
    } catch (error) {
      console.error("Failed to update save status:", error);
      // Revert optimistic update on error
      setRecipes(prev =>
        prev.map(r => (r.id === id ? { ...r, saved: !r.saved } : r))
      );
      // Show error to user
      setError("Failed to update save status. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Updated to use recipeService
  const toggleShare = async (id) => {
    try {
      // Optimistic UI update
      setRecipes(prev =>
        prev.map(r => (r.id === id ? { ...r, shared: !r.shared } : r))
      );
      
      // Get the current recipe
      const recipe = recipes.find(r => r.id === id);
      const newValue = !recipe.shared;
      
      // Call the API
      await recipeService.updateRecipeAction(id, 'share', newValue);
    } catch (error) {
      console.error("Failed to update share status:", error);
      // Revert optimistic update on error
      setRecipes(prev =>
        prev.map(r => (r.id === id ? { ...r, shared: !r.shared } : r))
      );
      // Show error to user
      setError("Failed to update share status. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <Template>
      <Box>
        <div style={{ textAlign: 'center' }}> 
          <Typography variant="h3" sx={{ color: 'primary.main', backgroundColor: 'white' }}>
            Saved Recipes
          </Typography>
        </div>

        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Error message display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Navigation to My Recipes */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Here are recipes you've saved. To create your own recipes, go to My Recipes.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/myrecipes')}
            >
              Go to My Recipes
            </Button>
          </Box>

          {/* Loading state */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : recipes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Saved Recipes
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You haven't saved any recipes yet. Browse recipes and save ones you like!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: theme.spacing(3) }}>
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
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {recipe.getTitle()}
                  </Typography>
                  <Box
                    onClick={() => handleRecipeClick(recipe)}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '100%', // This creates a perfect square (1:1 aspect ratio)
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
                    <Box
                      className="descOverlay"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        bgcolor: alpha(theme.palette.primary.dark, 0.7),
                        color: theme.palette.primary.contrastText,
                        px: 1,
                        py: 0.5,
                        opacity: 0,
                        transform: 'translateY(100%)',
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <Typography variant="body2">
                        {recipe.getInstructions()[0]}
                      </Typography>
                    </Box>
                  </Box>
                  <CardActions disableSpacing sx={{ mt: 'auto', pt: 1 }}>
                    <IconButton
                      onClick={() => toggleLike(recipe.id)}
                      aria-label="like"
                      color={recipe.liked ? 'error' : 'default'}
                    >
                      {recipe.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton
                      onClick={() => toggleSave(recipe.id)}
                      aria-label="save"
                      color={recipe.saved ? 'primary' : 'default'}
                    >
                      {recipe.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                    <IconButton
                      onClick={() => toggleShare(recipe.id)}
                      aria-label="share"
                      color={recipe.shared ? 'secondary' : 'default'}
                    >
                      {recipe.shared ? <ShareIcon /> : <ShareOutlinedIcon />}
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
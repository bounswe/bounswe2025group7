import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Grid, Box, IconButton, useTheme, Button, Rating,
  Chip, Divider, List, ListItem, ListItemText, Paper
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import Recipe from '../models/Recipe';
import Template from '../components/Template';

// Reuse the styled components you already have
const RecipeDetailSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(0, 0, 2, 0),
  borderRadius: theme.shape.borderRadius,
  background: alpha(theme.palette.background.paper, 0.8),
}));

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // States
  const [recipe, setRecipe] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch recipe data - in a real app, this would be an API call
  useEffect(() => {
    // This is a mock function - replace with your actual data fetching
    const fetchRecipe = async () => {
      try {
        // Here you would typically fetch from an API using the ID
        // For now, we'll use localStorage as a temporary store
        const allRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        const foundRecipe = allRecipes.find(r => r.id === parseInt(id));
        
        if (foundRecipe) {
          // Convert plain object back to Recipe instance
          const recipeObj = new Recipe(foundRecipe);
          recipeObj.liked = foundRecipe.liked || false;
          recipeObj.saved = foundRecipe.saved || false;
          recipeObj.shared = foundRecipe.shared || false;
          setRecipe(recipeObj);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id]);
  
  // Handle recipe actions
  const toggleLike = () => {
    if (!recipe) return;
    
    const updatedRecipe = new Recipe({ ...recipe });
    updatedRecipe.liked = !recipe.liked;
    updatedRecipe.saved = recipe.saved;
    updatedRecipe.shared = recipe.shared;
    setRecipe(updatedRecipe);
    
    // Update in storage (mock database)
    updateRecipeInStorage(updatedRecipe);
  };
  
  const toggleSave = () => {
    if (!recipe) return;
    
    const updatedRecipe = new Recipe({ ...recipe });
    updatedRecipe.liked = recipe.liked;
    updatedRecipe.saved = !recipe.saved;
    updatedRecipe.shared = recipe.shared;
    setRecipe(updatedRecipe);
    
    // Update in storage
    updateRecipeInStorage(updatedRecipe);
  };
  
  const toggleShare = () => {
    if (!recipe) return;
    
    const updatedRecipe = new Recipe({ ...recipe });
    updatedRecipe.liked = recipe.liked;
    updatedRecipe.saved = recipe.saved;
    updatedRecipe.shared = !recipe.shared;
    setRecipe(updatedRecipe);
    
    // Update in storage
    updateRecipeInStorage(updatedRecipe);
  };
  
  // Submit easiness rating
  const handleRatingSubmit = () => {
    if (recipe && userRating > 0) {
      alert(`Rating of ${userRating} submitted for ${recipe.getTitle()}`);
      
      // Update recipe with new easiness score
      const updatedRecipe = new Recipe({
        ...recipe,
        easinessScore: userRating
      });
      updatedRecipe.liked = recipe.liked;
      updatedRecipe.saved = recipe.saved;
      updatedRecipe.shared = recipe.shared;
      setRecipe(updatedRecipe);
      
      // Update in storage
      updateRecipeInStorage(updatedRecipe);
      
      setUserRating(0);
    }
  };
  
  // Helper to update recipe in localStorage
  const updateRecipeInStorage = (updatedRecipe) => {
    try {
      const allRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      const updatedRecipes = allRecipes.map(r => 
        r.id === updatedRecipe.id ? { 
          ...updatedRecipe,
          liked: updatedRecipe.liked,
          saved: updatedRecipe.saved,
          shared: updatedRecipe.shared
        } : r
      );
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };
  
  if (loading) {
    return (
      <Template>
        <Container>
          <Typography variant="h5" sx={{ my: 4, textAlign: 'center' }}>
            Loading recipe...
          </Typography>
        </Container>
      </Template>
    );
  }
  
  if (!recipe) {
    return (
      <Template>
        <Container>
          <Typography variant="h5" sx={{ my: 4, textAlign: 'center' }}>
            Recipe not found
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Box>
        </Container>
      </Template>
    );
  }
  
  return (
    <Template>
      <Box>
        {/* Back button */}
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
        </Container>
        
        {/* Hero section with image */}
        <Box sx={{ position: 'relative', height: '40vh', overflow: 'hidden' }}>
          <Box
            component="img"
            src={recipe.getPhoto()}
            alt={recipe.getTitle()}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: alpha(theme.palette.common.black, 0.6),
              color: 'white',
              p: 2,
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="h4">{recipe.getTitle()}</Typography>
              
              {recipe.getTag() && (
                <Chip 
                  label={recipe.getTag()} 
                  size="small" 
                  sx={{ mt: 1, bgcolor: alpha(theme.palette.primary.main, 0.8), color: 'white' }} 
                />
              )}
            </Container>
          </Box>
        </Box>
        
        {/* Main content area */}
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Grid container spacing={3}>
              {/* Left column - Recipe details */}
              <Grid item xs={12} md={8}>
                {/* Recipe type & meta information */}
                <RecipeDetailSection>
                  <Grid container spacing={2}>
                    {recipe.getType() && (
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalDiningIcon color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Type</Typography>
                            <Typography variant="body2">{recipe.getType()}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {recipe.getTotalCalory() > 0 && (
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalDiningIcon color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Calories</Typography>
                            <Typography variant="body2">{recipe.getTotalCalory()} cal</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {recipe.getPrice() > 0 && (
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Price</Typography>
                            <Typography variant="body2">${recipe.getPrice()}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {recipe.getWhoShared() && (
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Shared by</Typography>
                            <Typography variant="body2">{recipe.getWhoShared()}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </RecipeDetailSection>
                
                {/* Recipe ratings */}
                <RecipeDetailSection>
                  <Typography variant="h6" gutterBottom>Ratings</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>Healthiness</Typography>
                      <Rating 
                        value={recipe.getHealthinessScore()} 
                        readOnly 
                        precision={0.5}
                      />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>Easiness</Typography>
                      <Rating 
                        value={recipe.getEasinessScore()} 
                        readOnly 
                        precision={0.5}
                      />
                    </Grid>
                  </Grid>
                </RecipeDetailSection>
                
                {/* Instructions */}
                <RecipeDetailSection>
                  <Typography variant="h6" gutterBottom>Instructions</Typography>
                  {recipe.getInstructions().map((instruction, idx) => (
                    <Typography key={idx} variant="body1" paragraph>
                      {instruction}
                    </Typography>
                  ))}
                </RecipeDetailSection>
              </Grid>
              
              {/* Right column - Ingredients and actions */}
              <Grid item xs={12} md={4}>
                {/* User actions */}
                <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Actions</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                    <IconButton 
                      onClick={toggleLike}
                      color={recipe.liked ? "error" : "default"}
                      sx={{ flexDirection: 'column' }}
                    >
                      {recipe.liked ? <FavoriteIcon fontSize="large" /> : <FavoriteBorderIcon fontSize="large" />}
                      <Typography variant="caption">Like</Typography>
                    </IconButton>
                    
                    <IconButton 
                      onClick={toggleSave}
                      color={recipe.saved ? "primary" : "default"}
                      sx={{ flexDirection: 'column' }}
                    >
                      {recipe.saved ? <BookmarkIcon fontSize="large" /> : <BookmarkBorderIcon fontSize="large" />}
                      <Typography variant="caption">Save</Typography>
                    </IconButton>
                    
                    <IconButton 
                      onClick={toggleShare}
                      color={recipe.shared ? "secondary" : "default"}
                      sx={{ flexDirection: 'column' }}
                    >
                      {recipe.shared ? <ShareIcon fontSize="large" /> : <ShareOutlinedIcon fontSize="large" />}
                      <Typography variant="caption">Share</Typography>
                    </IconButton>
                  </Box>
                  
                  {/* Rate easiness */}
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Rate recipe easiness
                    </Typography>
                    <Rating
                      name="user-rating"
                      value={userRating}
                      onChange={(event, newValue) => {
                        setUserRating(newValue);
                      }}
                      precision={1}
                      size="large"
                    />
                    <Button 
                      variant="contained" 
                      sx={{ mt: 1 }}
                      disabled={userRating === 0}
                      onClick={handleRatingSubmit}
                    >
                      Submit Rating
                    </Button>
                  </Box>
                </Paper>
                
                {/* Ingredients list */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Ingredients</Typography>
                  {recipe.getIngredients() && recipe.getIngredients().length > 0 ? (
                    <List>
                      {recipe.getIngredients().map((ingredient, idx) => (
                        <ListItem key={idx} divider={idx < recipe.getIngredients().length - 1}>
                          <ListItemText
                            primary={ingredient.name}
                            secondary={ingredient.amount}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No ingredients listed
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Template>
  );
};

export default RecipeDetail;
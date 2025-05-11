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
import apiClient from '../services/apiClient';


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
    const fetchRecipe = async () => {
      console.log(id)
      const response = await apiClient.get(`/recipe/get?recipeId=${id}`);
      setRecipe(response.data);
      setLoading(false);
    };
  
    fetchRecipe();
  }, [id]);
  

  

  
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
            src={recipe["photo"]}
            alt={recipe["photo"]}
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
              <Typography variant="h4">{recipe["title"]}</Typography>
              
              {recipe["tag"] && (
                <Chip 
                  label={recipe["tag"]} 
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
                    {recipe["type"] && (
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalDiningIcon color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Type</Typography>
                            <Typography variant="body2">{recipe["type"]}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {recipe["totalCalorie"] > 0 && (
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalDiningIcon color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Calories</Typography>
                            <Typography variant="body2">{recipe["totalCalorie"]} cal</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    
                    {recipe["price"] > 0 && (
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon color="primary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Price</Typography>
                            <Typography variant="body2">${recipe["price"]}</Typography>
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
                        value={3} 
                        readOnly 
                        precision={0.5}
                      />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>Easiness</Typography>
                      <Rating 
                        value={3} 
                        readOnly 
                        precision={0.5}
                      />
                    </Grid>
                  </Grid>
                </RecipeDetailSection>
                
                {/* Instructions */}
                <RecipeDetailSection>
                  <Typography variant="h6" gutterBottom>Instructions</Typography>
                  {recipe["instructions"].map((instruction, idx) => (
                    <Typography key={idx} variant="body1" paragraph>
                      {instruction}
                    </Typography>
                  ))}
                </RecipeDetailSection>
              </Grid>
              
              {/* Right column - Ingredients and actions */}
              <Grid item xs={12} md={4}>
                {/* User actions */}
                
                
                {/* Ingredients list */}
                <Paper elevation={1} sx={{ p: 2 }}>
  <Typography variant="h6" gutterBottom>Ingredients</Typography>
  {recipe["ingredients"] && recipe["ingredients"].length > 0 ? (
    <List>
      {recipe["ingredients"].map((ingredientStr, idx) => {
        const parts = ingredientStr.split(':');
        const name = parts[0] ? parts[0].trim() : "";
        const amount = parts[1] ? parts[1].trim() : "";
        return (
          <ListItem key={idx} divider={idx < recipe["ingredients"].length - 1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="body1">{name}</Typography>
              <Typography variant="body1">{amount}</Typography>
            </Box>
          </ListItem>
        );
      })}
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
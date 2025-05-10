import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, 
  Dialog, DialogContent, DialogActions, Button, TextField, Stack, 
  Chip, MenuItem, Select, InputLabel, FormControl, Divider, Rating,
  List, ListItem, ListItemText, Paper, Avatar, CircularProgress, Alert
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddIcon from '@mui/icons-material/Add';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LabelIcon from '@mui/icons-material/Label';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import Recipe from '../models/Recipe';
import Template from '../components/Template';
import { useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService'; // Import the recipe service

// Static list for initial UI rendering - will be replaced with API data
const initialRecipes = [
  { id: 1, title: 'Avocado Quinoa Salad', image: 'https://picsum.photos/seed/avocado-quinoa-salad/300/300', description: 'A refreshing blend of avocado, quinoa, and fresh vegetables', liked: false, saved: false, shared: false },
  { id: 2, title: 'Mediterranean Chickpea Bowl', image: 'https://picsum.photos/seed/mediterranean-chickpea-bowl/300/300', description: 'Protein-packed chickpeas with olives, tomatoes, and feta', liked: false, saved: false, shared: false },
  // ...other recipes
];

const RecipeDetailSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(0, 0, 2, 0),
  borderRadius: theme.shape.borderRadius,
  background: alpha(theme.palette.background.paper, 0.8),
}));

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
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // States for new recipe form
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newPhotoBase64, setNewPhotoBase64] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newTotalCalory, setNewTotalCalory] = useState(0);
  const [newTag, setNewTag] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newType, setNewType] = useState('');
  const [newHealthinessScore, setNewHealthinessScore] = useState(0);
  const [newEasinessScore, setNewEasinessScore] = useState(0);
  
  // For ingredients
  const [newIngredients, setNewIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  
  const fileInputRef = useRef(null);

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

  // Handle file selection for image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setNewPhotoBase64(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle adding an ingredient
  const handleAddIngredient = () => {
    if (currentIngredient && currentAmount) {
      setNewIngredients([
        ...newIngredients, 
        { 
          name: currentIngredient, 
          amount: currentAmount 
        }
      ]);
      setCurrentIngredient('');
      setCurrentAmount('');
    }
  };
  
  // Handle removing an ingredient
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...newIngredients];
    updatedIngredients.splice(index, 1);
    setNewIngredients(updatedIngredients);
  };

  // Reset form fields
  const resetForm = () => {
    setNewTitle('');
    setNewInstructions('');
    setNewPhotoBase64('');
    setImagePreview(null);
    setNewTotalCalory(0);
    setNewTag('');
    setNewPrice(0);
    setNewType('');
    setNewHealthinessScore(0);
    setNewEasinessScore(0);
    setNewIngredients([]);
    setCurrentIngredient('');
    setCurrentAmount('');
  };

  // Updated to use recipeService for recipe creation
  const handleAddRecipe = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Prepare ingredient list in the format expected by API
      const ingredientList = newIngredients.map(ing => `${ing.name}: ${ing.amount}`);
      
      // Create recipe data object
      const recipeData = {
        title: newTitle,
        instructions: [newInstructions], // API expects array of instructions
        ingredients: ingredientList,
        tag: newTag,
        type: newType,
        photo: newPhotoBase64 || 'https://picsum.photos/seed/default/300/300',
        // Additional fields that might be needed
        totalCalory: Number(newTotalCalory),
        price: Number(newPrice)
      };
      
      // Call the API to create recipe
      const response = await recipeService.createRecipe(recipeData);
      console.log("Recipe created successfully:", response);
      
      // In a real app, we would fetch the newly created recipe with its ID
      // For now, we'll simulate it by creating a new Recipe object
      const newId = recipes.reduce((max, r) => (r.id > max ? r.id : max), 0) + 1;
      const newRecipe = new Recipe({
        id: newId,
        totalCalory: Number(newTotalCalory),
        ingredients: newIngredients,
        tag: newTag,
        price: Number(newPrice),
        title: newTitle,
        type: newType,
        instructions: [newInstructions],
        photo: newPhotoBase64 || 'https://picsum.photos/seed/default/300/300',
        healthinessScore: 0, // Set by users later
        easinessScore: 0, // Set by users later
        whoShared: null, // Could be set from user context
      });
      newRecipe.liked = false;
      newRecipe.saved = true;
      newRecipe.shared = false;
      
      // Add the new recipe to the list
      setRecipes([...recipes, newRecipe]);
      
      // Clear form fields and close the dialog
      resetForm();
      setOpenAddDialog(false);
      
    } catch (error) {
      console.error("Failed to create recipe:", error);
      setError("Failed to create recipe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit easiness rating using recipeService
  const handleRatingSubmit = async (recipeId, rating) => {
    try {
      await recipeService.submitRating(recipeId, rating, 'easiness');
      
      // Update the recipe in our local state
      setRecipes(prev => 
        prev.map(r => {
          if (r.id === recipeId) {
            // Create a new recipe with updated easiness score
            const updatedRecipe = new Recipe({
              ...r,
              easinessScore: rating
            });
            updatedRecipe.liked = r.liked;
            updatedRecipe.saved = r.saved;
            updatedRecipe.shared = r.shared;
            return updatedRecipe;
          }
          return r;
        })
      );
      
      // Reset rating input
      setUserRating(0);
      
    } catch (error) {
      console.error("Failed to submit rating:", error);
      setError("Failed to submit rating. Please try again.");
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
          
          {/* Button to open Add Recipe Dialog */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
              Add Recipe
            </Button>
          </Box>

          {/* Add Recipe Dialog */}
          <Dialog open={openAddDialog} onClose={() => !submitting && setOpenAddDialog(false)} maxWidth="md" fullWidth>
            <DialogContent>
              <Box component="form" onSubmit={handleAddRecipe} sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Add New Recipe
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Left column */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      sx={{ mb: 2 }}
                      required
                      disabled={submitting}
                    />
                    
                    <FormControl fullWidth sx={{ mb: 2 }} disabled={submitting}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={newType}
                        label="Type"
                        onChange={(e) => setNewType(e.target.value)}
                      >
                        <MenuItem value="breakfast">Breakfast</MenuItem>
                        <MenuItem value="lunch">Lunch</MenuItem>
                        <MenuItem value="dinner">Dinner</MenuItem>
                        <MenuItem value="dessert">Dessert</MenuItem>
                        <MenuItem value="snack">Snack</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      sx={{ mb: 2 }}
                      placeholder="e.g. vegetarian, gluten-free"
                      disabled={submitting}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        label="Total Calorie"
                        type="number"
                        value={newTotalCalory}
                        onChange={(e) => setNewTotalCalory(e.target.value)}
                        fullWidth
                        disabled={submitting}
                      />
                      <TextField
                        label="Price"
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        fullWidth
                        disabled={submitting}
                      />
                    </Box>
                    
                    {/* Photo upload section */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>Recipe Photo</Typography>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        disabled={submitting}
                      />
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                          variant="outlined"
                          startIcon={<PhotoCameraIcon />}
                          onClick={handleUploadClick}
                          disabled={submitting}
                        >
                          Upload Photo
                        </Button>
                        {imagePreview && (
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid #ccc'
                            }}
                          >
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                  
                  {/* Right column */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Instructions"
                      value={newInstructions}
                      onChange={(e) => setNewInstructions(e.target.value)}
                      sx={{ mb: 3 }}
                      required
                      multiline
                      rows={4}
                      disabled={submitting}
                    />
                    
                    <Typography variant="subtitle1" gutterBottom>Ingredients</Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        label="Ingredient"
                        value={currentIngredient}
                        onChange={(e) => setCurrentIngredient(e.target.value)}
                        fullWidth
                        disabled={submitting}
                      />
                      <TextField
                        label="Amount"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(e.target.value)}
                        fullWidth
                        disabled={submitting}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={handleAddIngredient}
                        disabled={!currentIngredient || !currentAmount || submitting}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ 
                      border: '1px solid #eee', 
                      borderRadius: 1, 
                      p: 2, 
                      minHeight: '150px', 
                      maxHeight: '200px', 
                      overflow: 'auto'
                    }}>
                      {newIngredients.length === 0 ? (
                        <Typography color="text.secondary" align="center">
                          No ingredients added yet
                        </Typography>
                      ) : (
                        <Stack spacing={1}>
                          {newIngredients.map((ingredient, index) => (
                            <Chip
                              key={index}
                              label={`${ingredient.name}: ${ingredient.amount}`}
                              onDelete={() => !submitting && handleRemoveIngredient(index)}
                              variant="outlined"
                              disabled={submitting}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => {
                  resetForm();
                  setOpenAddDialog(false);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddRecipe} 
                variant="contained" 
                color="primary"
                disabled={!newTitle || !newInstructions || submitting}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Add Recipe'
                )}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Loading state */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
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
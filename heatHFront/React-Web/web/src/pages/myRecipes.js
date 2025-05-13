import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, 
  Dialog, DialogContent, DialogActions, Button, TextField, Stack, 
  Chip, MenuItem, Select, InputLabel, FormControl, Divider, Rating, Menu,
  List, ListItem, ListItemText, Paper, Avatar, CircularProgress, Alert,
  Tooltip
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Recipe from '../models/Recipe';
import Template from '../components/Template';
import { useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService';
import apiClient from '../services/apiClient';

// Static list for initial UI rendering - will be replaced with API data
// For My Recipes, assume these are user-created recipes
const initialRecipes = [
  { id: 101, title: 'My Homemade Pizza', image: 'https://picsum.photos/seed/homemade-pizza/300/300', description: 'Crispy crust with fresh toppings and melted cheese', liked: false, saved: false, shared: false, isOwnRecipe: true },
  { id: 102, title: 'Family Pasta Recipe', image: 'https://picsum.photos/seed/pasta-recipe/300/300', description: 'Traditional pasta with homemade sauce and herbs', liked: false, saved: false, shared: true, isOwnRecipe: true },
];

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 0),
  textAlign: 'center',
}));

const MyRecipes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  
  // Action menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const openMenu = Boolean(menuAnchorEl);

  // States for new/edit recipe form
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
  const ingredientInputRef = useRef(null);
  
  // For delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // Fetch my recipes on component mount
  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/recipe/get-all');
      setRecipes(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      setError("Failed to load recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const handleRecipeClick = (recipe) => {
    // Navigate to the recipe detail page
    navigate(`/recipe/${recipe.id}`);
  };

  // Menu handling
  const handleMenuClick = (event, recipeId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRecipeId(recipeId);
    event.stopPropagation(); // Prevent card click
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRecipeId(null);
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
      if (ingredientInputRef.current) {
        ingredientInputRef.current.focus();
      }
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
    setIsEditing(false);
    setEditingRecipeId(null);
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

  // Handle add/edit recipe submit
  const handleRecipeFormSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setSubmitting(true);
  
      // Prepare ingredient list in the format expected by API
      const ingredientList = newIngredients.map(ing => `${ing.name}: ${ing.amount}`);
  
      // Create recipe data object according to API requirements
      const recipeData = {
        title: newTitle,
        instructions: [newInstructions], // API expects array of instructions
        ingredients: ingredientList,
        tag: newTag,
        type: newType,
        photo: newPhotoBase64 || 'https://picsum.photos/seed/default/300/300',
        totalCalorie: Number(newTotalCalory),
        price: Number(newPrice),
      };
  
      if (isEditing) {
        // Update existing recipe
        try {
          const response = await fetch(`http://167.172.162.159:8080/api/recipe/update?recipeId=${editingRecipeId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify(recipeData),
          });
  
          if (!response.ok) {
            throw new Error(`Error updating recipe: ${response.statusText}`);
          }
  
      
  
          console.log("Recipe updated successfully");
        } catch (error) {
          console.error("Failed to update recipe:", error);
          setError(`Failed to update recipe: ${error.message}`);
          throw error;
        }
      } else {
        // Create new recipe with POST request
        try {
          const response = await apiClient.post("/recipe/create", recipeData);
  
          if (response.status !== 200) {
            throw new Error(`Error creating recipe: ${response.statusText}`);
          }
  
          // Show success message
          setError("Recipe created successfully!");
          setTimeout(() => setError(null), 3000);
          
          // Close the dialog
          setOpenAddDialog(false);
          
          // Refresh the recipes list
          await fetchMyRecipes();
          
        } catch (error) {
          console.error("Failed to create recipe:", error);
          setError(`Failed to create recipe: ${error.message}`);
          throw error;
        }
      }
  
      // Clear form fields
      resetForm();
    } catch (error) {
      // Error handling is done in the nested try-catch blocks
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Template>
      <Box>
        <div style={{ textAlign: 'center' }}> 
          <Typography variant="h3" sx={{ color: 'primary.main', backgroundColor: 'white' }}>
            My Recipes
          </Typography>
        </div>

        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Error message display */}
          {error && (
            <Alert 
              severity={error.includes("successfully") ? "success" : "error"} 
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}
          
          {/* Button to open Add Recipe Dialog */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Create your own recipes and share them with others. Visit Saved Recipes to view recipes you've bookmarked.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => {
                  resetForm();
                  setOpenAddDialog(true);
                }}
                startIcon={<AddIcon />}
              >
                Create New Recipe
              </Button>
              
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/saved')}
              >
                View Saved Recipes
              </Button>
            </Box>
          </Box>

          {/* Loading state */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : recipes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Recipes Yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You haven't created any recipes yet. Click "Create New Recipe" to get started!
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
                  position: 'relative', // For more options button
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}>
                    <Typography variant="h6" sx={{ 
                      m: 2, 
                      color: 'text.primary',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flexGrow: 1,
                    }}>
                      {recipe.title}
                    </Typography>
                    
                    <IconButton
                      onClick={(e) => handleMenuClick(e, recipe.id)}
                      size="small"
                      sx={{ flexShrink: 0 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
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
                      src={recipe.photo}
                      alt={recipe.photo}
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
                        {recipe.instructions[0]}
                      </Typography>
                    </Box>
                  </Box>
            
                </Card>
              ))}
            </Box>
          )}
          
          {/* Recipe Options Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={openMenu}
            onClose={handleMenuClose}
          >
            
          </Menu>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Delete Recipe?
              </Typography>
              <Typography variant="body1">
                Are you sure you want to delete this recipe? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
            
            </DialogActions>
          </Dialog>

          {/* Add/Edit Recipe Dialog */}
          <Dialog open={openAddDialog} onClose={() => !submitting && setOpenAddDialog(false)} maxWidth="md" fullWidth>
            <DialogContent>
              <Box component="form" onSubmit={handleRecipeFormSubmit} sx={{ p: 2 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
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
                        inputRef={ingredientInputRef}
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
                onClick={handleRecipeFormSubmit} 
                variant="contained" 
                color="primary"
                disabled={!newTitle || !newInstructions || submitting}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isEditing ? (
                  'Update Recipe'
                ) : (
                  'Create Recipe'
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Template>
  );
};

export default MyRecipes;

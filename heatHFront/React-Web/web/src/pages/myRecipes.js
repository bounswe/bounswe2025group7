import React, { useState, useRef, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme,
  Dialog, DialogContent, DialogActions, Button, TextField, Stack,
  Chip, MenuItem, Select, InputLabel, FormControl, Divider, Rating, Menu,
  List, ListItem, ListItemText, Paper, Avatar, CircularProgress, Alert,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import Recipe from '../models/Recipe';
import Template from '../components/Template';
import { useNavigate } from 'react-router-dom';
import recipeService from '../services/recipeService';
import apiClient from '../services/apiClient';
import { Refresh } from '@mui/icons-material';

// Static list for initial UI rendering - will be replaced with API data
// For My Recipes, assume these are user-created recipes
const initialRecipes = [
  { id: 101, title: 'My Homemade Pizza', image: 'https://picsum.photos/seed/homemade-pizza/300/300', description: 'Crispy crust with fresh toppings and melted cheese', liked: false, saved: false, shared: false, isOwnRecipe: true },
  { id: 102, title: 'Family Pasta Recipe', image: 'https://picsum.photos/seed/pasta-recipe/300/300', description: 'Traditional pasta with homemade sauce and herbs', liked: false, saved: false, shared: true, isOwnRecipe: true },
];

const MEASUREMENT_OPTIONS = [
  { value: 'GRAM', label: 'g' },
  { value: 'ML', label: 'ml' },
  { value: 'TEASPOON', label: 'tsp' },
  { value: 'TABLESPOON', label: 'tbsp' },
  { value: 'CUP', label: 'cup' },
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
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [currentInstruction, setCurrentInstruction] = useState('');

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
  const [currentUnit, setCurrentUnit] = useState('GRAM');

  const fileInputRef = useRef(null);
  const ingredientInputRef = useRef(null);

  // For delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // Check if all form fields are filled
  const isFormComplete = newTitle && newType && newTag && newInstructions && newIngredients.length > 0 && newPrice;

  // Fetch my recipes on component mount
  useEffect(() => {
    const fetchMyRecipes = async () => {
      const response = await apiClient.get('/recipe/get-all');
      setRecipes(response.data)
      setLoading(false);
    }

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

  const handleAddInstruction = () => {
    if (currentInstruction.trim()) {
      setNewInstructions([...newInstructions, currentInstruction.trim()]);
      setCurrentInstruction('');
    }
  };
  
  const handleRemoveInstruction = (index) => {
    const updated = [...newInstructions];
    updated.splice(index, 1);
    setNewInstructions(updated);
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
          amount: currentAmount,
          type: currentUnit || 'GRAM'
        }
      ]);
      setCurrentIngredient('');
      setCurrentAmount('');
      setCurrentUnit('GRAM');
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
    setCurrentUnit('GRAM');
  };

  // Handle add/edit recipe submit
  const handleRecipeFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // ✅ Updated ingredient mapping for new API schema
      const ingredientList = newIngredients.map(ing => ({
        name: ing.name,
        quantity: Number(ing.amount) || 0, // ensure it's an integer
        type: ing.type || 'GRAM',
      }));

      const recipeData = {
        title: newTitle,
        instructions: newInstructions,
        ingredients: ingredientList, // now an array of objects
        tag: newTag,
        type: newType,
        photo: newPhotoBase64 || 'https://picsum.photos/seed/default/300/300',
        totalCalorie: Number(newTotalCalory),
        price: Number(newPrice),
      };

      if (isEditing) {
        // Update existing recipe
        try {
          const response = await fetch(
              `http://167.172.162.159:8080/api/recipe/update?recipeId=${editingRecipeId}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(recipeData),
              }
          );

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
        // Create new recipe
        try {
          const response = await apiClient.post("/recipe/create", recipeData);

          if (response.status !== 200) {
            throw new Error(`Error creating recipe: ${response.statusText}`);
          }

          console.log("Recipe created successfully:", response.data);
          setOpenAddDialog(false);

          // Refresh list
          setLoading(true);
          const fetchResponse = await apiClient.get('/recipe/get-all');
          setRecipes(fetchResponse.data);
          setLoading(false);
        } catch (error) {
          console.error("Failed to create recipe:", error);
          setError(`Failed to create recipe: ${error.message}`);
          throw error;
        }
      }

      // Clear form fields
      resetForm();
    } catch (error) {
      // already handled
    } finally {
      setSubmitting(false);
    }
  };


  // Handle edit click
  const handleEditClick = (recipeId) => {
    // Find the recipe to edit
    const recipeToEdit = recipes.find(r => r.id === recipeId);
    if (recipeToEdit) {
      setIsEditing(true);
      setEditingRecipeId(recipeId);
      setNewTitle(recipeToEdit.title);
      setNewInstructions(recipeToEdit.instructions || []);
      setImagePreview(recipeToEdit.photo);
      setNewTotalCalory(recipeToEdit.totalCalorie || 0);
      setNewTag(recipeToEdit.tag || '');
      setNewPrice(recipeToEdit.price || 0);
      setNewType(recipeToEdit.type || '');

      // Parse ingredients if they exist
      if (recipeToEdit.ingredients && recipeToEdit.ingredients.length > 0) {
        const parsedIngredients = recipeToEdit.ingredients.map(ing => {
          if (typeof ing === 'string') {
            const [rawName, rawRest] = ing.split(':').map(part => part.trim());
            const [amountPart, unitPart] = (rawRest || '').split(' ').filter(Boolean);
            return {
              name: rawName || ing,
              amount: amountPart || '',
              type: (unitPart || 'GRAM').toUpperCase()
            };
          }
          return {
            name: ing.name || '',
            amount: ing.quantity ?? ing.amount ?? '',
            type: ing.type || 'GRAM',
          };
        });
        setNewIngredients(parsedIngredients);
      }

      setOpenAddDialog(true);
    }
    handleMenuClose();
  };

  // Handle view click
  const handleViewClick = (recipeId) => {
    // Find the recipe to view
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      // Navigate to recipe detail page
      navigate(`/recipe/${recipe.id}`);
    }
    handleMenuClose();
  };

  // Handle delete click from menu
  const handleDeleteClick = (recipeId) => {
    setRecipeToDelete(recipeId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle actual deletion when confirmed
  const handleDeleteConfirm = async () => {
    try {
      const response = await apiClient.delete(`/recipe/delete-recipe`, { data: { id: recipeToDelete } });

      if (response.status === 200) {
        // Remove the deleted recipe from state
        setRecipes(recipes.filter(recipe => recipe.id !== recipeToDelete));
        setDeleteDialogOpen(false);
        setRecipeToDelete(null);
      } else {
        setError('Failed to delete recipe');
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError(`Failed to delete recipe: ${err.message}`);
    }
  };

  return (
    <Template>
      <Box>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Error message display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
                {t('recipes.noRecipesYet')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                {t('recipes.noRecipesYetMessage')}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  resetForm();
                  setOpenAddDialog(true);
                }}
                startIcon={<AddIcon />}
                size="large"
              >
                {t('recipes.createRecipe')}
              </Button>
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
            <MenuItem onClick={() => handleViewClick(selectedRecipeId)}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              View
            </MenuItem>
            <MenuItem onClick={() => handleDeleteClick(selectedRecipeId)}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
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
              <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add/Edit Recipe Dialog */}
          <Dialog
            open={openAddDialog}
            onClose={() => !submitting && setOpenAddDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, boxShadow: 24 } }}
          >
            <DialogContent sx={{ backgroundColor: 'background.paper', p: 4, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, '-ms-overflow-style': 'none', scrollbarWidth: 'none' }}>
              <Box component="form" onSubmit={handleRecipeFormSubmit} sx={{ p: 2, width: '94%', maxWidth: 650, mx: 'auto' }}>
                <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
                  {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
                </Typography>

                {!isFormComplete && !submitting && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Please fill in all fields to create a recipe.
                  </Alert>
                )}

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

                    <FormControl fullWidth sx={{ mb: 2 }} disabled={submitting} required>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={newType}
                        label="Type"
                        onChange={(e) => setNewType(e.target.value)}
                        required
                      >
                        <MenuItem value="breakfast">Breakfast</MenuItem>
                        <MenuItem value="lunch">Lunch</MenuItem>
                        <MenuItem value="dinner">Dinner</MenuItem>
                        <MenuItem value="dessert">Dessert</MenuItem>
                        <MenuItem value="snack">Snack</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      required
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
                        required
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
                    <Typography variant="subtitle1" gutterBottom>Instructions</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        label="Instruction"
                        value={currentInstruction}
                        onChange={(e) => setCurrentInstruction(e.target.value)}
                        fullWidth
                        disabled={submitting}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddInstruction();
                          }
                        }}
                      />
                      <IconButton
                        color="primary"
                        onClick={handleAddInstruction}
                        disabled={!currentInstruction || submitting}
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
                      {newInstructions.length === 0 ? (
                        <Typography color="text.secondary" align="center">
                          No instructions added yet
                        </Typography>
                      ) : (
                        <Stack spacing={1}>
                          {newInstructions.map((instruction, index) => (
                            <Chip
                              key={index}
                              label={`${index + 1}. ${instruction}`}
                              onDelete={() => !submitting && handleRemoveInstruction(index)}
                              variant="outlined"
                              disabled={submitting}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>


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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddIngredient();
                          }
                        }}
                        fullWidth
                        disabled={submitting}
                      />
                      <FormControl sx={{ minWidth: 120 }} disabled={submitting}>
                        <InputLabel>Unit</InputLabel>
                        <Select
                          value={currentUnit}
                          label="Unit"
                          onChange={(e) => setCurrentUnit(e.target.value)}
                        >
                          {MEASUREMENT_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                              label={`${ingredient.name}: ${ingredient.amount} ${MEASUREMENT_OPTIONS.find(opt => opt.value === ingredient.type)?.label || ingredient.type || ''}`}
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
            <DialogActions sx={{ px: 4, py: 2, justifyContent: 'flex-end', gap: 2 }}>
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
                disabled={!isFormComplete || submitting}
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

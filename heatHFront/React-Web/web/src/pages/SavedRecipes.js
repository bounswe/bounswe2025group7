import React, { useState, useRef } from 'react';
import { 
  Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, 
  Dialog, DialogContent, DialogActions, Button, TextField, Stack, 
  Chip, MenuItem, Select, InputLabel, FormControl, Divider, Rating
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
import Recipe from '../models/Recipe';
import Template from '../components/Template';

const initialRecipes = [
  (() => {
    const r = new Recipe({
      id: 1,
      totalCalory: 100,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Avocado Quinoa Salad',
      type: '',
      instructions: ['A refreshing blend of avocado, quinoa, and fresh vegetables'],
      photo: 'https://picsum.photos/seed/avocado-quinoa-salad/300/300',
      healthinessScore: 5,
      easinessScore: 5,
      whoShared: "ben",
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 2,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Mediterranean Chickpea Bowl',
      type: '',
      instructions: ['Protein-packed chickpeas with olives, tomatoes, and feta'],
      photo: 'https://picsum.photos/seed/mediterranean-chickpea-bowl/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 3,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Berry Banana Smoothie',
      type: '',
      instructions: ['Sweet strawberries, blueberries, and bananas blended to perfection'],
      photo: 'https://picsum.photos/seed/berry-banana-smoothie/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 4,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Grilled Chicken & Veggies',
      type: '',
      instructions: ['Juicy grilled chicken served with a medley of seasonal vegetables'],
      photo: 'https://picsum.photos/seed/grilled-chicken-veggies/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 5,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Thai Peanut Noodle Salad',
      type: '',
      instructions: ['Rice noodles tossed with crunchy veggies and spicy peanut sauce'],
      photo: 'https://picsum.photos/seed/thai-peanut-noodle-salad/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 6,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Kale Citrus Salad',
      type: '',
      instructions: ['Fresh kale leaves with orange segments and tangy vinaigrette'],
      photo: 'https://picsum.photos/seed/kale-citrus-salad/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 7,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Sweet Potato Buddha Bowl',
      type: '',
      instructions: ['Roasted sweet potatoes, greens, and chickpeas in a hearty bowl'],
      photo: 'https://picsum.photos/seed/sweet-potato-buddha-bowl/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 8,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Zucchini Noodle Alfredo',
      type: '',
      instructions: ['Low-carb zucchini noodles smothered in creamy cashew-based alfredo'],
      photo: 'https://picsum.photos/seed/zucchini-noodle-alfredo/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 9,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Salmon Poke Bowl',
      type: '',
      instructions: ['Fresh salmon cubes over rice with avocado and seaweed salad'],
      photo: 'https://picsum.photos/seed/salmon-poke-bowl/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 10,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Lentil Vegetable Soup',
      type: '',
      instructions: ['Hearty lentils simmered with carrots, celery, and aromatic herbs'],
      photo: 'https://picsum.photos/seed/lentil-vegetable-soup/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 11,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Spinach Mushroom Omelette',
      type: '',
      instructions: ['Fluffy eggs filled with sautéed mushrooms and fresh spinach'],
      photo: 'https://picsum.photos/seed/spinach-mushroom-omelette/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 12,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Black Bean Tacos',
      type: '',
      instructions: ['Soft tortillas loaded with seasoned black beans and fresh salsa'],
      photo: 'https://picsum.photos/seed/black-bean-tacos/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 13,
      totalCalory: 200,
      ingredients: [],
      tag: '',
      price: 100,
      title: 'Greek Yogurt Parfait',
      type: '',
      instructions: ['Layers of creamy yogurt, crunchy granola, and mixed berries'],
      photo: 'https://picsum.photos/seed/greek-yogurt-parfait/300/300',
      healthinessScore: 2,
      easinessScore: 1,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 14,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Turkey Lettuce Wraps',
      type: '',
      instructions: ['Spiced ground turkey wrapped in crisp lettuce leaves'],
      photo: 'https://picsum.photos/seed/turkey-lettuce-wraps/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
  (() => {
    const r = new Recipe({
      id: 15,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Mango Chia Pudding',
      type: '',
      instructions: ['Creamy mango puree combined with chia seeds for a nutritious treat'],
      photo: 'https://picsum.photos/seed/mango-chia-pudding/300/300',
      healthinessScore: 0,
      easinessScore: 0,
      whoShared: null,
    });
    r.liked = false;
    r.saved = true;
    r.shared = false;
    return r;
  })(),
];

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 0),
  textAlign: 'center',
}));

const SavedRecipes = () => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState(initialRecipes);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

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

  const handleOpenDialog = (recipe) => {
    setSelectedRecipe(recipe);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecipe(null);
  };

  const toggleLike = (id) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, liked: !r.liked } : r))
    );
  };

  const toggleSave = (id) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r))
    );
  };

  const toggleShare = (id) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, shared: !r.shared } : r))
    );
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

  // Handle add recipe form submission
  const handleAddRecipe = (e) => {
    e.preventDefault();
    // determine new id by taking max id + 1
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
      // healthinessScore: Number(newHealthinessScore),
      // easinessScore: Number(newEasinessScore),
      whoShared: null,
    });
    newRecipe.liked = false;
    newRecipe.saved = true;
    newRecipe.shared = false;
    setRecipes([...recipes, newRecipe]);
    
    // clear form fields and close the dialog
    resetForm();
    setOpenAddDialog(false);
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
          {/* Button to open Add Recipe Dialog */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
              Add Recipe
            </Button>
          </Box>

          {/* Add Recipe Dialog */}
          <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
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
                    />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
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
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        label="Total Calorie"
                        type="number"
                        value={newTotalCalory}
                        onChange={(e) => setNewTotalCalory(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Price"
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        fullWidth
                      />
                    </Box>
                    
                    {/* <Box sx={{ mb: 2 }}>
                      <Typography gutterBottom>Healthiness Score</Typography>
                      <Rating
                        name="healthiness"
                        value={newHealthinessScore}
                        onChange={(e, newValue) => setNewHealthinessScore(newValue)}
                        max={5}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom>Easiness Score</Typography>
                      <Rating
                        name="easiness"
                        value={newEasinessScore}
                        onChange={(e, newValue) => setNewEasinessScore(newValue)}
                        max={5}
                      />
                    </Box> */}
                    
                    {/* Photo upload section */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>Recipe Photo</Typography>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                          variant="outlined"
                          startIcon={<PhotoCameraIcon />}
                          onClick={handleUploadClick}
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
                    />
                    
                    <Typography variant="subtitle1" gutterBottom>Ingredients</Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        label="Ingredient"
                        value={currentIngredient}
                        onChange={(e) => setCurrentIngredient(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Amount"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(e.target.value)}
                        fullWidth
                      />
                      <IconButton 
                        color="primary" 
                        onClick={handleAddIngredient}
                        disabled={!currentIngredient || !currentAmount}
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
                              onDelete={() => handleRemoveIngredient(index)}
                              variant="outlined"
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
              <Button onClick={() => {
                resetForm();
                setOpenAddDialog(false);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddRecipe} 
                variant="contained" 
                color="primary"
                disabled={!newTitle || !newInstructions}
              >
                Add Recipe
              </Button>
            </DialogActions>
          </Dialog>

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
                  onClick={() => handleOpenDialog(recipe)}
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

          {/* Recipe Details Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                <Box component="img" src={selectedRecipe?.getPhoto()} alt={selectedRecipe?.getTitle()} 
                  sx={{ width: { xs: '100%', md: '50%' }, height: 300, objectFit: 'cover' }} 
                />
                <Box sx={{ p: 2, width: { xs: '100%', md: '50%' } }}>
                  <Typography variant="h5" gutterBottom>
                    {selectedRecipe?.getTitle()}
                  </Typography>
                  
                  {selectedRecipe?.getType() && (
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Type: {selectedRecipe?.getType()}
                    </Typography>
                  )}
                  
                  {selectedRecipe?.getTag() && (
                    <Chip label={selectedRecipe?.getTag()} size="small" sx={{ mb: 1 }} />
                  )}
                  
                  <Box sx={{ my: 1, display: 'flex', gap: 2 }}>
                    {selectedRecipe?.getHealthinessScore() > 0 && (
                      <Box>
                        <Typography variant="caption">Health</Typography>
                        <Rating value={selectedRecipe?.getHealthinessScore()} readOnly size="small" />
                      </Box>
                    )}
                    
                    {selectedRecipe?.getEasinessScore() > 0 && (
                      <Box>
                        <Typography variant="caption">Ease</Typography>
                        <Rating value={selectedRecipe?.getEasinessScore()} readOnly size="small" />
                      </Box>
                    )}
                  </Box>
                  
                  {selectedRecipe?.getTotalCalory() > 0 && (
                    <Typography variant="body2" gutterBottom>
                      Calories: {selectedRecipe?.getTotalCalory()}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body1">
                    {selectedRecipe?.getInstructions()[0]}
                  </Typography>
                  
                  {selectedRecipe?.getIngredients()?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Ingredients:
                      </Typography>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {selectedRecipe?.getIngredients().map((ing, idx) => (
                          <li key={idx}>
                            {ing.name}: {ing.amount}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Template>
  );
};

export default SavedRecipes;
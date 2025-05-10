import React, { useState, useRef } from 'react';
import { Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, Dialog, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import Template from '../components/Template';

// Static list of 15 recipes
const initialRecipes = [
  { id: 1, title: 'Avocado Quinoa Salad', image: 'https://picsum.photos/seed/avocado-quinoa-salad/300/300', description: 'A refreshing blend of avocado, quinoa, and fresh vegetables', liked: false, saved: false, shared: false },
  { id: 2, title: 'Mediterranean Chickpea Bowl', image: 'https://picsum.photos/seed/mediterranean-chickpea-bowl/300/300', description: 'Protein-packed chickpeas with olives, tomatoes, and feta', liked: false, saved: false, shared: false },
  { id: 3, title: 'Berry Banana Smoothie', image: 'https://picsum.photos/seed/berry-banana-smoothie/300/300', description: 'Sweet strawberries, blueberries, and bananas blended to perfection', liked: false, saved: false, shared: false },
  { id: 4, title: 'Grilled Chicken & Veggies', image: 'https://picsum.photos/seed/grilled-chicken-veggies/300/300', description: 'Juicy grilled chicken served with a medley of seasonal vegetables', liked: false, saved: false, shared: false },
  { id: 5, title: 'Thai Peanut Noodle Salad', image: 'https://picsum.photos/seed/thai-peanut-noodle-salad/300/300', description: 'Rice noodles tossed with crunchy veggies and spicy peanut sauce', liked: false, saved: false, shared: false },
  { id: 6, title: 'Kale Citrus Salad', image: 'https://picsum.photos/seed/kale-citrus-salad/300/300', description: 'Fresh kale leaves with orange segments and tangy vinaigrette', liked: false, saved: false, shared: false },
  { id: 7, title: 'Sweet Potato Buddha Bowl', image: 'https://picsum.photos/seed/sweet-potato-buddha-bowl/300/300', description: 'Roasted sweet potatoes, greens, and chickpeas in a hearty bowl', liked: false, saved: false, shared: false },
  { id: 8, title: 'Zucchini Noodle Alfredo', image: 'https://picsum.photos/seed/zucchini-noodle-alfredo/300/300', description: 'Low-carb zucchini noodles smothered in creamy cashew-based alfredo', liked: false, saved: false, shared: false },
  { id: 9, title: 'Salmon Poke Bowl', image: 'https://picsum.photos/seed/salmon-poke-bowl/300/300', description: 'Fresh salmon cubes over rice with avocado and seaweed salad', liked: false, saved: false, shared: false },
  { id: 10, title: 'Lentil Vegetable Soup', image: 'https://picsum.photos/seed/lentil-vegetable-soup/300/300', description: 'Hearty lentils simmered with carrots, celery, and aromatic herbs', liked: false, saved: false, shared: false },
  { id: 11, title: 'Spinach Mushroom Omelette', image: 'https://picsum.photos/seed/spinach-mushroom-omelette/300/300', description: 'Fluffy eggs filled with sautéed mushrooms and fresh spinach', liked: false, saved: false, shared: false },
  { id: 12, title: 'Black Bean Tacos', image: 'https://picsum.photos/seed/black-bean-tacos/300/300', description: 'Soft tortillas loaded with seasoned black beans and fresh salsa', liked: false, saved: false, shared: false },
  { id: 13, title: 'Greek Yogurt Parfait', image: 'https://picsum.photos/seed/greek-yogurt-parfait/300/300', description: 'Layers of creamy yogurt, crunchy granola, and mixed berries', liked: false, saved: false, shared: false },
  { id: 14, title: 'Turkey Lettuce Wraps', image: 'https://picsum.photos/seed/turkey-lettuce-wraps/300/300', description: 'Spiced ground turkey wrapped in crisp lettuce leaves', liked: false, saved: false, shared: false },
  { id: 15, title: 'Mango Chia Pudding', image: 'https://picsum.photos/seed/mango-chia-pudding/300/300', description: 'Creamy mango puree combined with chia seeds for a nutritious treat', liked: false, saved: false, shared: false },
];

// add header styled component
const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 0),
  textAlign: 'center',
}));

const HomePage = () => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState(
    initialRecipes.map((r) => ({ ...r, saved: false }))
  );
  // Post composer state
  const [userInputText, setUserInputText] = useState('');
  const [postType, setPostType] = useState(null); // 'image' or 'recipe'
  const [postImage, setPostImage] = useState(null);
  const [selectedRecipeForPost, setSelectedRecipeForPost] = useState('');
  const fileInputRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  // Recipe selection modal
  const [recipeSelectionDialogOpen, setRecipeSelectionDialogOpen] = useState(false);

  const handleOpenDialog = (recipe) => {
    setSelectedRecipe(recipe);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecipe(null);
  };

  const handleLike = (id) => {
    // placeholder for backend request
    fetch(`/api/recipes/${id}/like`, { method: 'POST' }).catch(console.error);
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, liked: !r.liked } : r)));
  };

  const handleSave = (id) => {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r)));
  };

  const handleShare = (id) => {
    // placeholder for backend request
    fetch(`/api/recipes/${id}/share`, { method: 'POST' }).catch(console.error);
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, shared: !r.shared } : r)));
  };

  // Composer handlers
  const handleAddImageClick = () => {
    // only open file selector; postType will change on actual selection
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPostImage(e.target.files[0]);
      setPostType('image');
      // clear any selected recipe since now posting an image
      setSelectedRecipeForPost('');
    }
    // reset input so same file can be reselected
    e.target.value = '';
  };
  const handleAddRecipeClick = () => {
    setRecipeSelectionDialogOpen(true);
  };
  
  const handleRecipeSelect = (recipe) => {
    setSelectedRecipeForPost(recipe.id);
    setPostType('recipe');
    setRecipeSelectionDialogOpen(false);
  };
  
  const handleCloseRecipeDialog = () => {
    setRecipeSelectionDialogOpen(false);
  };

  // Send handler for post composer
  const handleSend = () => {
    let type;
    if (postType === 'recipe') type = 'RECIPE';
    else if (postType === 'image' && userInputText) type = 'IMAGE_AND_TEXT';
    else if (postType === 'image') type = 'IMAGE_AND_TEXT';
    else type = 'TEXT';
    const postPayload = { type, text: userInputText, image: postImage, recipeId: selectedRecipeForPost };
    console.log('Posting:', postPayload);
    // Clear composer
    setUserInputText('');
    setPostImage(null);
    setSelectedRecipeForPost('');
    setPostType(null);
  };

  // Get selected recipe details 
  const getSelectedRecipeDetails = () => {
    return initialRecipes.find(r => r.id === selectedRecipeForPost);
  };

  return (
    <Template>
      <Box>
      <div style={{ textAlign: 'center' }}> 
        <Typography variant="h3" sx={{ color: 'primary.main', backgroundColor: 'white' }}>
              Home
        </Typography>

        </div>
           
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Post composer box */}
          <Card sx={{ mb: 4, p: 2, maxWidth: 600, mx: 'auto' }}>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="What's on your mind?"
              value={userInputText}
              onChange={(e) => setUserInputText(e.target.value)}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant={postType === 'image' ? 'contained' : 'outlined'}
                disabled={postType === 'recipe'}
                onClick={handleAddImageClick}
              >
                Add Image
              </Button>
              <Button
                variant={postType === 'recipe' ? 'contained' : 'outlined'}
                disabled={postType === 'image'}
                onClick={handleAddRecipeClick}
              >
                Add Recipe
              </Button>
            </Box>
            {/* hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {/* Image preview */}
            {postType === 'image' && postImage && (
              <Box component="img" src={URL.createObjectURL(postImage)} alt="preview" sx={{ width: '100%', mt: 2 }} />
            )}
            {/* Recipe preview */}
            {postType === 'recipe' && selectedRecipeForPost && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  component="img" 
                  src={getSelectedRecipeDetails()?.image} 
                  alt={getSelectedRecipeDetails()?.title} 
                  sx={{ width: 100, height: 100, objectFit: 'cover' }} 
                />
                <Typography variant="body1">{getSelectedRecipeDetails()?.title}</Typography>
              </Box>
            )}
            {/* Composer actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              {postType === 'image' && postImage && (
                <Button color="secondary" onClick={() => { setPostImage(null); setPostType(null); }}>
                  Remove Image
                </Button>
              )}
              {postType === 'recipe' && selectedRecipeForPost && (
                <Button color="secondary" onClick={() => { setSelectedRecipeForPost(''); setPostType(null); }}>
                  Remove Recipe
                </Button>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSend}
                disabled={!userInputText && !postImage && !selectedRecipeForPost}
              >
                Send
              </Button>
            </Box>
          </Card>
          <Grid container spacing={4}>
            {recipes.map((recipe) => (
              <Grid item key={recipe.id} xs={12}>
                <Card sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                  <Typography variant="h6" sx={{ m: 2, color: 'text.primary' }}>
                    {recipe.title}
                  </Typography>
                  <Box
                    onClick={() => handleOpenDialog(recipe)}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '100%',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover .descOverlay': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
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
                        {recipe.description}
                      </Typography>
                    </Box>
                  </Box>
                  <CardActions disableSpacing>
                    <IconButton
                      onClick={() => handleLike(recipe.id)}
                      aria-label="like"
                      color={recipe.liked ? 'error' : 'default'}
                    >
                      {recipe.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton
                      onClick={() => handleSave(recipe.id)}
                      aria-label="save"
                      color={recipe.saved ? 'primary' : 'default'}
                    >
                      {recipe.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                    <IconButton
                      onClick={() => handleShare(recipe.id)}
                      aria-label="share"
                      color={recipe.shared ? 'secondary' : 'default'}
                    >
                      {recipe.shared ? <ShareIcon /> : <ShareOutlinedIcon />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
        {/* Dialog for recipe details */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box component="img" src={selectedRecipe?.image} alt={selectedRecipe?.title} sx={{ width: { xs: '100%', md: '50%' }, height: 300, objectFit: 'cover' }} />
              <Box sx={{ p: 2, width: { xs: '100%', md: '50%' } }}>
                <Typography variant="h5" gutterBottom>
                  {selectedRecipe?.title}
                </Typography>
                <Typography variant="body1">
                  {selectedRecipe?.description}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Recipe Selection Dialog */}
        <Dialog 
          open={recipeSelectionDialogOpen} 
          onClose={handleCloseRecipeDialog} 
          maxWidth="md" 
          fullWidth
        >
          <DialogContent>
            <Typography variant="h5" gutterBottom align="center">
              Select a Recipe
            </Typography>
            <Grid container spacing={2}>
              {initialRecipes.map((recipe) => (
                <Grid item key={recipe.id} xs={6} sm={4} md={3}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: 6,
                      }
                    }}
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    <Typography variant="subtitle1" align="center" sx={{ p: 1, fontWeight: 'bold' }}>
                      {recipe.title}
                    </Typography>
                    <Box sx={{ flexGrow: 1, position: 'relative', pt: '100%' }}>
                      <img
                        src={recipe.image}
                        alt={recipe.title}
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
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRecipeDialog} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Template>
  );
};

export default HomePage; 
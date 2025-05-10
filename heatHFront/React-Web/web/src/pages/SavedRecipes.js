import React, { useState } from 'react';
import { Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import Recipe from '../models/Recipe';

const initialRecipes = [
  (() => {
    const r = new Recipe({
      id: 1,
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Avocado Quinoa Salad',
      type: '',
      instructions: ['A refreshing blend of avocado, quinoa, and fresh vegetables'],
      photo: 'https://picsum.photos/seed/avocado-quinoa-salad/300/300',
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
      totalCalory: 0,
      ingredients: [],
      tag: '',
      price: 0,
      title: 'Greek Yogurt Parfait',
      type: '',
      instructions: ['Layers of creamy yogurt, crunchy granola, and mixed berries'],
      photo: 'https://picsum.photos/seed/greek-yogurt-parfait/300/300',
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

  return (
    <Box>
      <HeaderSection>
        <Container>
          <Typography variant="h1" gutterBottom sx={{ mb: 0, color: '#2c363fff' }}>
        Saved Recipes
      </Typography>
        </Container>
      </HeaderSection>
      <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {recipes.map((recipe) => (
          <Grid item key={recipe.id} xs={12} sm={6} md={4}>
            <Card>
              <Typography variant="h6" sx={{ m: 2, color: 'text.primary' }}>
                  {recipe.getTitle()}
              </Typography>
                <Box onClick={() => handleOpenDialog(recipe)} sx={{ position: 'relative', width: '100%', pt: '100%', overflow: 'hidden', cursor: 'pointer', '&:hover .descOverlay': { opacity: 1, transform: 'translateY(0)' } }}>
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
              <CardActions disableSpacing>
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
          </Grid>
        ))}
      </Grid>
        {/* Dialog for recipe details */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box component="img" src={selectedRecipe?.getPhoto()} alt={selectedRecipe?.getTitle()} sx={{ width: { xs: '100%', md: '50%' }, height: 300, objectFit: 'cover' }} />
              <Box sx={{ p: 2, width: { xs: '100%', md: '50%' } }}>
                <Typography variant="h5" gutterBottom>
                  {selectedRecipe?.getTitle()}
                </Typography>
                <Typography variant="body1">
                  {selectedRecipe?.getInstructions()[0]}
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
    </Container>
    </Box>
  );
};

export default SavedRecipes; 
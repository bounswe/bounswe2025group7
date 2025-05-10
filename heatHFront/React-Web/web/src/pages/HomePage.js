import React, { useState } from 'react';
import { Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';

// Static list of 15 recipes
const initialRecipes = [
  { id: 1, title: 'Avocado Quinoa Salad', image: 'https://picsum.photos/seed/avocado-quinoa-salad/300/300', description: 'A refreshing blend of avocado, quinoa, and fresh vegetables',
    longDescription: 'Begin by rinsing one cup of quinoa under cold water. Cook the quinoa in two cups of water for 15 minutes until fluffy. Meanwhile, cube two ripe avocados and chop a mix of cucumber, cherry tomatoes, and red onion. Once quinoa has cooled, combine it with the vegetables, drizzle with olive oil and fresh lemon juice, season with salt and pepper, and garnish with chopped cilantro or parsley for a flavorful, nutritious salad.', liked: false, saved: true, shared: false },
  { id: 2, title: 'Mediterranean Chickpea Bowl', image: 'https://picsum.photos/seed/mediterranean-chickpea-bowl/300/300', description: 'Protein-packed chickpeas with olives, tomatoes, and feta',
    longDescription: 'Start by draining and rinsing a can of chickpeas. In a large bowl, combine chickpeas with sliced Kalamata olives, diced tomatoes, cucumber, and crumbled feta cheese. Whisk together olive oil, red wine vinegar, minced garlic, oregano, salt, and pepper for the dressing. Pour dressing over the bowl, toss until everything is coated, and let chill for 10 minutes before serving to allow flavors to meld.', liked: false, saved: true, shared: false },
  { id: 3, title: 'Berry Banana Smoothie', image: 'https://picsum.photos/seed/berry-banana-smoothie/300/300', description: 'Sweet strawberries, blueberries, and bananas blended to perfection',
    longDescription: 'In a blender, combine one frozen banana with half a cup of strawberries, half a cup of blueberries, and a quarter cup of Greek yogurt. Add a splash of almond milk and a teaspoon of honey for sweetness. Blend until smooth and creamy, adjusting liquid as needed. Pour into a glass and top with fresh berries and a sprinkle of chia seeds for added texture and nutrients.', liked: false, saved: true, shared: false },
  { id: 4, title: 'Grilled Chicken & Veggies', image: 'https://picsum.photos/seed/grilled-chicken-veggies/300/300', description: 'Juicy grilled chicken served with a medley of seasonal vegetables',
    longDescription: 'Marinate chicken breasts in olive oil, lemon juice, minced garlic, rosemary, salt, and pepper for at least 30 minutes. Preheat grill to medium-high heat and cook chicken for 6-7 minutes per side, until internal temperature reaches 165°F. Toss sliced bell peppers, zucchini, and mushrooms in olive oil and grill alongside until tender and lightly charred. Slice chicken and serve over veggies with a drizzle of balsamic glaze.', liked: false, saved: true, shared: false },
  { id: 5, title: 'Thai Peanut Noodle Salad', image: 'https://picsum.photos/seed/thai-peanut-noodle-salad/300/300', description: 'Rice noodles tossed with crunchy veggies and spicy peanut sauce', liked: false, saved: true, shared: false },
  { id: 6, title: 'Kale Citrus Salad', image: 'https://picsum.photos/seed/kale-citrus-salad/300/300', description: 'Fresh kale leaves with orange segments and tangy vinaigrette', liked: false, saved: true, shared: false },
  { id: 7, title: 'Sweet Potato Buddha Bowl', image: 'https://picsum.photos/seed/sweet-potato-buddha-bowl/300/300', description: 'Roasted sweet potatoes, greens, and chickpeas in a hearty bowl', liked: false, saved: true, shared: false },
  { id: 8, title: 'Zucchini Noodle Alfredo', image: 'https://picsum.photos/seed/zucchini-noodle-alfredo/300/300', description: 'Low-carb zucchini noodles smothered in creamy cashew-based alfredo', liked: false, saved: true, shared: false },
  { id: 9, title: 'Salmon Poke Bowl', image: 'https://picsum.photos/seed/salmon-poke-bowl/300/300', description: 'Fresh salmon cubes over rice with avocado and seaweed salad', liked: false, saved: true, shared: false },
  { id: 10, title: 'Lentil Vegetable Soup', image: 'https://picsum.photos/seed/lentil-vegetable-soup/300/300', description: 'Hearty lentils simmered with carrots, celery, and aromatic herbs', liked: false, saved: true, shared: false },
  { id: 11, title: 'Spinach Mushroom Omelette', image: 'https://picsum.photos/seed/spinach-mushroom-omelette/300/300', description: 'Fluffy eggs filled with sautéed mushrooms and fresh spinach', liked: false, saved: true, shared: false },
  { id: 12, title: 'Black Bean Tacos', image: 'https://picsum.photos/seed/black-bean-tacos/300/300', description: 'Soft tortillas loaded with seasoned black beans and fresh salsa', liked: false, saved: true, shared: false },
  { id: 13, title: 'Greek Yogurt Parfait', image: 'https://picsum.photos/seed/greek-yogurt-parfait/300/300', description: 'Layers of creamy yogurt, crunchy granola, and mixed berries', liked: false, saved: true, shared: false },
  { id: 14, title: 'Turkey Lettuce Wraps', image: 'https://picsum.photos/seed/turkey-lettuce-wraps/300/300', description: 'Spiced ground turkey wrapped in crisp lettuce leaves', liked: false, saved: true, shared: false },
  { id: 15, title: 'Mango Chia Pudding', image: 'https://picsum.photos/seed/mango-chia-pudding/300/300', description: 'Creamy mango puree combined with chia seeds for a nutritious treat', liked: false, saved: true, shared: false },
];

// add header styled component
const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(4, 0),
  textAlign: 'center',
}));

const HomePage = () => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState(
    initialRecipes.map((r) => ({ ...r, saved: false }))
  );
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

  return (
    <Box>
      <HeaderSection>
        <Container>
          <Typography variant="h1" gutterBottom sx={{ mb: 0, color: '#2c363fff' }}>
            All Recipes
          </Typography>
        </Container>
      </HeaderSection>
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {recipes.map((recipe) => (
            <Grid item key={recipe.id} xs={12} sm={6} md={4}>
              <Card>
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
                {selectedRecipe?.longDescription}
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
    </Box>
  );
};

export default HomePage; 
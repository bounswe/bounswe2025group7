import React, { useState } from 'react';
import { Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';

// Generate 15 fake recipes
const initialRecipes = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: `Recipe ${i + 1}`,
  image: `https://via.placeholder.com/300?text=Recipe+${i + 1}`,
  description: `A delicious and healthy dish #${i + 1}`,
  liked: false,
  saved: true,
  shared: false,
}));

const SavedRecipes = () => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState(initialRecipes);

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
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Saved Recipes
      </Typography>
      <Grid container spacing={4}>
        {recipes.map((recipe) => (
          <Grid item key={recipe.id} xs={12} sm={6} md={4}>
            <Card>
              <Typography variant="h6" sx={{ m: 2, color: 'text.primary' }}>
                {recipe.title}
              </Typography>
              <Box sx={{ position: 'relative', width: '100%', pt: '100%' }}>
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
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    bgcolor: alpha(theme.palette.primary.dark, 0.7),
                    color: theme.palette.primary.contrastText,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2">
                    {recipe.description}
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
    </Container>
  );
};

export default SavedRecipes; 
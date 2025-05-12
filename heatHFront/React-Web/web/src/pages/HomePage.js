import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, Dialog, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import Template from '../components/Template';
import Recipe from '../models/Recipe';
import recipeService from '../services/recipeService';
import feedService from '../services/feedService';
import apiClient from '../services/apiClient';

// Static list for initial UI rendering - will be replaced with API data
const initialRecipes = [
  { id: 1, title: 'Avocado Quinoa Salad', image: 'https://picsum.photos/seed/avocado-quinoa-salad/300/300', description: 'A refreshing blend of avocado, quinoa, and fresh vegetables', liked: false, saved: false, shared: false },
  { id: 2, title: 'Mediterranean Chickpea Bowl', image: 'https://picsum.photos/seed/mediterranean-chickpea-bowl/300/300', description: 'Protein-packed chickpeas with olives, tomatoes, and feta', liked: false, saved: false, shared: false },
  // ...other recipes
];

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 0),
  textAlign: 'center',
}));

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Post composer state
  const [userInputText, setUserInputText] = useState('');
  const [postType, setPostType] = useState(null);
  const [postImage, setPostImage] = useState(null);
  const [selectedRecipeForPost, setSelectedRecipeForPost] = useState('');
  const fileInputRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeSelectionDialogOpen, setRecipeSelectionDialogOpen] = useState(false);

  // Function to fetch recent posts from API
  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/feeds/recent');
      setFeeds(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch feeds:', err);
      setError('Failed to load feeds. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchFeeds();
  }, []);

  // Navigate to recipe detail page
  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/${recipe.getId()}`);
  };

  // Handle like action using recipeService
  const handleLike = async (id) => {
    try {
      // Optimistic UI update first
      setRecipes(prev => 
        prev.map(r => {
          if (r.getId() === id) {
            const newValue = !r.liked;
            r.liked = newValue;
            return r;
          }
          return r;
        })
      );
      
      // Then send the request to the server
      await recipeService.updateRecipeAction(id, 'like', !recipes.find(r => r.getId() === id).liked);
    } catch (err) {
      console.error("Failed to update like status:", err);
      // Revert the optimistic update on error
      setRecipes(prev => 
        prev.map(r => {
          if (r.getId() === id) {
            r.liked = !r.liked; // Revert back
            return r;
          }
          return r;
        })
      );
    }
  };

  // Handle save action using recipeService
  const handleSave = async (id) => {
    try {
      // Optimistic UI update first
      setRecipes(prev => 
        prev.map(r => {
          if (r.getId() === id) {
            const newValue = !r.saved;
            r.saved = newValue;
            return r;
          }
          return r;
        })
      );
      
      // Then send the request to the server
      await recipeService.updateRecipeAction(id, 'save', !recipes.find(r => r.getId() === id).saved);
    } catch (err) {
      console.error("Failed to update save status:", err);
      // Revert the optimistic update on error
      setRecipes(prev => 
        prev.map(r => {
          if (r.getId() === id) {
            r.saved = !r.saved; // Revert back
            return r;
          }
          return r;
        })
      );
    }
  };

  // Handle share action using recipeService
  const handleShare = async (id) => {
    try {
      // Optimistic UI update first
      setRecipes(prev => 
        prev.map(r => {
          if (r.getId() === id) {
            const newValue = !r.shared;
            r.shared = newValue;
            return r;
          }
          return r;
        })
      );
      
      // Then send the request to the server
      await recipeService.updateRecipeAction(id, 'share', !recipes.find(r => r.getId() === id).shared);
    } catch (err) {
      console.error("Failed to update share status:", err);
      // Revert the optimistic update on error
      setRecipes(prev => 
        prev.map(r => {
          if (r.getId() === id) {
            r.shared = !r.shared; // Revert back
            return r;
          }
          return r;
        })
      );
    }
  };

  // Post composer handlers
  const handleAddImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPostImage(e.target.files[0]);
      setPostType('image');
      setSelectedRecipeForPost('');
    }
    e.target.value = '';
  };
  
  const handleAddRecipeClick = () => {
    setRecipeSelectionDialogOpen(true);
  };
  
  const handleRecipeSelect = (recipe) => {
    setSelectedRecipeForPost(recipe.getId());
    setPostType('recipe');
    setRecipeSelectionDialogOpen(false);
  };
  
  const handleCloseRecipeDialog = () => {
    setRecipeSelectionDialogOpen(false);
  };

  // Send handler for post composer
  const handleSend = async () => {
    let type;
    if (postType === 'recipe') type = 'RECIPE';
    else if (postType === 'image') type = 'IMAGE_AND_TEXT';
    else type = 'TEXT';
    
    const postPayload = { 
      type, 
      text: userInputText, 
      image: postImage, 
      recipeId: selectedRecipeForPost 
    };
    console.log('Posting feed:', postPayload);
    try {
      await feedService.createFeed(postPayload);
      await fetchFeeds();
    } catch (err) {
      console.error('Failed to create feed:', err);
    }
    // Clear composer
    setUserInputText('');
    setPostImage(null);
    setSelectedRecipeForPost('');
    setPostType(null);
  };

  // Get selected recipe details
  const getSelectedRecipeDetails = () => {
    return recipes.find(r => r.getId() === selectedRecipeForPost);
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
            {postType === 'recipe' && selectedRecipeForPost && getSelectedRecipeDetails() && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  component="img" 
                  src={getSelectedRecipeDetails().getPhoto()} 
                  alt={getSelectedRecipeDetails().getTitle()} 
                  sx={{ width: 100, height: 100, objectFit: 'cover' }} 
                />
                <Typography variant="body1">{getSelectedRecipeDetails().getTitle()}</Typography>
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

          {/* Feed listing */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress/></Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography color="error">{error}</Typography>
              <Button sx={{ mt: 2 }} variant="contained" onClick={() => window.location.reload()}>Retry</Button>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {feeds.map(feed => (
                <Card key={feed.id} sx={{ width: '100%', boxShadow: 2, '&:hover': { boxShadow: 6 } }}>
                  {feed.type === 'TEXT' && <Box sx={{ p:2 }}><Typography>{feed.text}</Typography></Box>}
                  {feed.type === 'IMAGE_AND_TEXT' && <Box sx={{ p:2 }}><Box component="img" src={feed.image} alt="feed" sx={{ width:'100%', mb:1 }}/><Typography>{feed.text}</Typography></Box>}
                  {feed.type === 'RECIPE' && feed.recipe && <>
                    <Typography variant="h6" sx={{ m:2 }}>{feed.recipe.title}</Typography>
                    <Box onClick={() => navigate(`/recipe/${feed.recipe.id}`)} sx={{ position:'relative', width:'100%', pt:'100%', overflow:'hidden', cursor:'pointer', '&:hover .descOverlay': { opacity:1, transform:'translateY(0)' } }}>
                      <img src={feed.recipe.photo} alt={feed.recipe.title} style={{ position:'absolute', top:0,left:0,width:'100%',height:'100%',objectFit:'cover' }}/>
                      <Box className="descOverlay" sx={{ position:'absolute', bottom:0, width:'100%', bgcolor: alpha(theme.palette.primary.dark,0.7), color: theme.palette.primary.contrastText, px:1, py:0.5, opacity:0, transform:'translateY(100%)', transition:'all 0.3s ease-in-out' }}>
                        <Typography variant="body2">{feed.recipe.instructions[0]}</Typography>
                      </Box>
                    </Box>
                  </>}
                  <CardActions disableSpacing>
                    <IconButton onClick={() => handleLike(feed.id)} aria-label="like" color={feed.likedByCurrentUser?'error':'default'}>
                      {feed.likedByCurrentUser?<FavoriteIcon/>:<FavoriteBorderIcon/>}
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Container>
        
        {/* Recipe Selection Dialog - for post composer */}
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
              {recipes.map((recipe) => (
                <Box
                  key={recipe.getId()}
                  onClick={() => handleRecipeSelect(recipe)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    pt: '100%',
                    boxShadow: 2,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 6,
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
                    sx={{
                      position: 'absolute',
                      top: 0,
                      width: '100%',
                      bgcolor: alpha(theme.palette.primary.dark, 0.7),
                      color: theme.palette.primary.contrastText,
                      py: 0.5,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" noWrap>
                      {recipe.getTitle()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
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
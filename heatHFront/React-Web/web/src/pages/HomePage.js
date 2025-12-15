import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Grid, Card, Box, CardActions, IconButton, useTheme, Dialog, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress, Snackbar, Avatar } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import Template from '../components/Template';
import Recipe from '../models/Recipe';
import recipeService from '../services/recipeService';
import feedService from '../services/feedService';
import apiClient, { checkIfRecipeSaved, saveRecipe, unsaveRecipe } from '../services/apiClient';
import Drawer from '@mui/material/Drawer';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import Backdrop from '@mui/material/Backdrop';
import Menu from '@mui/material/Menu';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';



const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2, 0),
  textAlign: 'center',
}));
  

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [commentFeed, setCommentFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [recipeToShare, setRecipeToShare] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);

  // Function to fetch recent posts from API
  const fetchFeeds = async (page = 0) => {
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const response = await apiClient.get('/feeds/recent', { params: { pageNumber: page } });
      
      // Get user's saved recipes to check which recipes are already saved
      const savedResponse = await apiClient.get('/saved-recipes/get');
      const savedRecipeIds = savedResponse.data.map(recipe => recipe.recipeId);
      
      // Mark recipes as saved if they're in the user's saved list
      const feedsWithSavedStatus = response.data.map(feed => {
        if (feed.type === 'RECIPE' && feed.recipe) {
          return {
            ...feed,
            savedByCurrentUser: savedRecipeIds.includes(feed.recipe.id)
          };
        }
        return feed;
      });
      
      if (page === 0) {
        setFeeds(feedsWithSavedStatus);
      } else {
        setFeeds(prev => [...prev, ...feedsWithSavedStatus]);
      }
      if (feedsWithSavedStatus.length === 0) {
        setHasMore(false);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch feeds:', err);
      setError(t('feed.loadError'));
    } finally {
      if (page === 0) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

    
  const fetchMyRecipes = async () => {
      const response = await apiClient.get('/recipe/get-all');
      setRecipes(response.data)
      setLoading(false);
    }
        
        

  // Toggle like/unlike for a feed (optimistic UI update)
  const handleLikeFeed = async (feedId, currentlyLiked) => {
    const newLiked = !currentlyLiked;
    
    // Optimistically update UI for main feed
    setFeeds(prev => prev.map(f => 
      f.id === feedId
        ? { ...f, likedByCurrentUser: newLiked, likeCount: f.likeCount + (newLiked ? 1 : -1) }
        : f
    ));
    
    // Also update commentFeed if the same post is open in dialog
    if (commentFeed && commentFeed.id === feedId) {
      setCommentFeed(prev => ({
        ...prev,
        likedByCurrentUser: newLiked,
        likeCount: (prev.likeCount || 0) + (newLiked ? 1 : -1)
      }));
    }
    
    try {
      if (newLiked) {
        await apiClient.post('/feeds/like', { feedId });
      } else {
        await apiClient.post('/feeds/unlike', { feedId });
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      
      // Revert on error - main feed
      setFeeds(prev => prev.map(f => 
        f.id === feedId
          ? { ...f, likedByCurrentUser: currentlyLiked, likeCount: f.likeCount + (currentlyLiked ? 1 : -1) }
          : f
      ));
      
      // Revert on error - comment dialog
      if (commentFeed && commentFeed.id === feedId) {
        setCommentFeed(prev => ({
          ...prev,
          likedByCurrentUser: currentlyLiked,
          likeCount: (prev.likeCount || 0) + (currentlyLiked ? 1 : -1)
        }));
      }
    }
  };

  // Toggle bookmark/unbookmark for a recipe
  const handleBookmarkRecipe = async (recipeId, currentlySaved) => {
    try {
      // Optimistically update UI for main feed
      if (currentlySaved) {
        setFeeds(prev => prev.map(f => 
          f.type === 'RECIPE' && f.recipe?.id === recipeId
            ? { ...f, savedByCurrentUser: false }
            : f
        ));
        // Also update commentFeed if the same recipe is open in dialog
        if (commentFeed && commentFeed.type === 'RECIPE' && commentFeed.recipe?.id === recipeId) {
          setCommentFeed(prev => ({
            ...prev,
            savedByCurrentUser: false
          }));
        }
        // Call the API to unsave the recipe
        await unsaveRecipe(recipeId);
      } else {
        setFeeds(prev => prev.map(f => 
          f.type === 'RECIPE' && f.recipe?.id === recipeId
            ? { ...f, savedByCurrentUser: true }
            : f
        ));
        if (commentFeed && commentFeed.type === 'RECIPE' && commentFeed.recipe?.id === recipeId) {
          setCommentFeed(prev => ({
            ...prev,
            savedByCurrentUser: true
          }));
        }
        await saveRecipe(recipeId);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      // On error, refresh feeds to correct state
      try {
        const response = await apiClient.get('/feeds/recent');
        const savedResponse = await apiClient.get('/saved-recipes/get');
        const savedRecipeIds = savedResponse.data.map(recipe => recipe.recipeId);
        const feedsWithSavedStatus = response.data.map(feed => {
          if (feed.type === 'RECIPE' && feed.recipe) {
            return {
              ...feed,
              savedByCurrentUser: savedRecipeIds.includes(feed.recipe.id)
            };
          }
          return feed;
        });
        setFeeds(feedsWithSavedStatus);
        if (commentFeed) {
          const updatedFeed = feedsWithSavedStatus.find(f => f.id === commentFeed.id);
          if (updatedFeed) {
            setCommentFeed(updatedFeed);
          }
        }
      } catch (refreshErr) {
        console.error('Failed to refresh feeds after bookmark error:', refreshErr);
      }
    }
  };

  // Trigger next page when sentinel (last post) enters viewport
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading && !loadingMore && hasMore) {
        setPageNumber(prev => prev + 1);
      }
    }, { rootMargin: '100px' });
    observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, loadingMore, hasMore]);

  // Fetch posts when pageNumber changes
  useEffect(() => {
    fetchFeeds(pageNumber);
  }, [pageNumber]);

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
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
      };
      reader.readAsDataURL(file);
      setPostType('image');
      setSelectedRecipeForPost('');
    }
    e.target.value = '';
  };
  
  const handleAddRecipeClick = () => {
    fetchMyRecipes();
    setRecipeSelectionDialogOpen(true);
  };
  
  const handleRecipeSelect = (recipe) => {
    // Handle both plain objects and Recipe instances
    setSelectedRecipeForPost(recipe.id || recipe.getId?.());
    setPostType('recipe');
    setRecipeSelectionDialogOpen(false);
  };
  
  const handleCloseRecipeDialog = () => {
    setRecipeSelectionDialogOpen(false);
  };

  // Send handler for post composer
  const handleSend = async () => {
    // Build payload dynamically so that only non-empty properties are sent.
    const payload = {
      type: postType === 'recipe'
        ? 'RECIPE'
        : postType === 'image'
          ? 'IMAGE_AND_TEXT'
          : 'TEXT',
      ...(userInputText.trim() && { text: userInputText.trim() }),
      ...(postType === 'image' && postImage && { image: postImage }),
      ...(postType === 'recipe' && selectedRecipeForPost && { recipeId: selectedRecipeForPost })
    };
    
    console.log('Posting feed:', payload);
    try {
      await feedService.createFeed(payload);
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
    return recipes.find(r => (r.id || r.getId?.()) === selectedRecipeForPost);
  };

  const handleCommentClick = async (feed) => {
    setCommentFeed(feed);
    setComments([]);  // Clear comments initially
    setNewComment('');
    setCommentDialogOpen(true);
    setCommentsLoading(true);
    
    // Fetch comments from the backend
    try {
      const response = await apiClient.get('/feeds/get-feed-comments', { params: { feedId: feed.id }});
      if (response.data) {
        setComments(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setSnackbarMessage(t('feed.commentsLoadError'));
      setSnackbarOpen(true);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCloseComments = () => {
    setCommentDialogOpen(false);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !commentFeed) return;
    
    setCommentsLoading(true);
    
    try {
      // Send the comment to the backend
      await apiClient.post('/feeds/comment', { 
        feedId: commentFeed.id, 
        message: newComment.trim() 
      });
      
      // Clear the input
      setNewComment('');
      
      // Refresh comments from the backend
      const response = await apiClient.get('/feeds/get-feed-comments', { params: { feedId: commentFeed.id }});
      
      
      if (response.data) {
        setComments(response.data);
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      setSnackbarMessage(t('feed.commentsPostError'));
      setSnackbarOpen(true);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Handle share functionality for recipes
  const handleShareClick = (event, recipeId, recipeTitle) => {
    event.stopPropagation(); // Prevent other click handlers
    setShareAnchorEl(event.currentTarget);
    setRecipeToShare({ id: recipeId, title: recipeTitle });
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const copyLinkToClipboard = () => {
    if (!recipeToShare) return;
    
    const recipeUrl = `${window.location.origin}/recipe/${recipeToShare.id}`;
    navigator.clipboard.writeText(recipeUrl)
      .then(() => {
        setSnackbarMessage(t('recipes.linkCopied'));
        setSnackbarOpen(true);
        handleShareClose();
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        setSnackbarMessage(t('recipes.linkCopyFailed'));
        setSnackbarOpen(true);
      });
  };

  const shareToSocial = (platform) => {
    if (!recipeToShare) return;
    
    const recipeUrl = `${window.location.origin}/recipe/${recipeToShare.id}`;
    const recipeTitle = recipeToShare.title || t('recipes.checkOutRecipe');
    let shareUrl;

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(recipeTitle)}&url=${encodeURIComponent(recipeUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(recipeTitle + ' ' + recipeUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    handleShareClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Template>
      <Box>
        <Container maxWidth={false} disableGutters sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Post composer box */}
          <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto', mb: 4 }}>
            <Card sx={{ p: 2, width: '100%', transition: 'none' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar
                sx={{ width: 48, height: 48 }}
                alt={t('common.profile')}
              />
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder={t('home.welcome')}
                value={userInputText}
                onChange={(e) => setUserInputText(e.target.value)}
              />
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
              <Box component="img" src={postImage} alt="preview" sx={{ width: '100%', mt: 2 }} />
            )}
            {/* Recipe preview */}
            {postType === 'recipe' && selectedRecipeForPost && getSelectedRecipeDetails() && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  component="img" 
                  src={getSelectedRecipeDetails().photo || getSelectedRecipeDetails().getPhoto?.()} 
                  alt={getSelectedRecipeDetails().title || getSelectedRecipeDetails().getTitle?.()} 
                  sx={{ width: 100, height: 100, objectFit: 'cover' }} 
                />
                <Typography variant="body1">
                  {getSelectedRecipeDetails().title || getSelectedRecipeDetails().getTitle?.()}
                </Typography>
              </Box>
            )}
            {/* Composer actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              {/* Chip-like actions */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={postType === 'recipe'}
                  onClick={handleAddImageClick}
                  startIcon={<PhotoCameraIcon fontSize="small" />}
                  sx={{ minWidth: 0, px: 1.25, py: 0.75, borderRadius: 999 }}
                >
                  {t('home.uploadPhoto')}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={postType === 'image'}
                  onClick={handleAddRecipeClick}
                  startIcon={<AttachFileIcon fontSize="small" />}
                  sx={{ minWidth: 0, px: 1.25, py: 0.75, borderRadius: 999 }}
                >
                  {t('home.attachRecipe')}
                </Button>
              </Box>

              {/* Delete controls */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {postType === 'image' && postImage && (
                  <Button color="secondary" onClick={() => { setPostImage(null); setPostType(null); }}>
                    {t('common.delete')}
                  </Button>
                )}
                {postType === 'recipe' && selectedRecipeForPost && (
                  <Button color="secondary" onClick={() => { setSelectedRecipeForPost(''); setPostType(null); }}>
                    {t('common.delete')}
                  </Button>
                )}
              </Box>

              <Box sx={{ flexGrow: 1 }} />
              {postType === 'image' && postImage && (
                null
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSend}
                disabled={!userInputText && !postImage && !selectedRecipeForPost}
              >
                {t('home.post')}
              </Button>
            </Box>
            </Card>
          </Box>

          {/* Feed listing */}
          {loading && pageNumber === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress/></Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography color="error">{error}</Typography>
              <Button sx={{ mt: 2 }} variant="contained" onClick={() => window.location.reload()}>{t('common.retry')}</Button>
            </Box>
          ) : (
            <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {feeds.map(feed => (
                <Card
                  key={feed.id}
                  sx={{
                    width: '100%',
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? '#353535' : '#f3f4f6',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 20px rgba(0,0,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 16px 30px rgba(0,0,0,0.4)'
                        : '0 4px 16px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Publisher info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/user/${feed.userId}`)}>
                    <Avatar src={feed.profilePhoto} alt={`${feed.name} ${feed.surname}`} />
                    <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 'bold' }}>
                      {feed.name} {feed.surname}
                    </Typography>
                  </Box>
                  {feed.type === 'TEXT' && <Box sx={{ pt:2 }}><Typography>{feed.text}</Typography></Box>}
                  {feed.type === 'IMAGE_AND_TEXT' && <Box sx={{ pt:2 }}><Box component="img" src={feed.image} alt="feed" sx={{ width:'100%', mb:1 }}/><Typography>{feed.text}</Typography></Box>}
                  {feed.type === 'RECIPE' && feed.recipe && <>
                    <Typography variant="h6" sx={{ mt:2, mb:2 }}>{feed.recipe.title}</Typography>
                    <Box onClick={() => navigate(`/recipe/${feed.recipe.id}`)} sx={{ position:'relative', width:'100%', pt:'100%', overflow:'hidden', cursor:'pointer', '&:hover .descOverlay': { opacity:1, transform:'translateY(0)' } }}>
                      <img src={feed.recipe.photo} alt={feed.recipe.title} style={{ position:'absolute', top:0,left:0,width:'100%',height:'100%',objectFit:'cover' }}/>
                      <Box className="descOverlay" sx={{ position:'absolute', bottom:0, width:'100%', bgcolor: alpha(theme.palette.primary.dark,0.7), color: theme.palette.primary.contrastText, px:1, py:0.5, opacity:0, transform:'translateY(100%)', transition:'all 0.3s ease-in-out' }}>
                        <Typography variant="body2">{feed.recipe.instructions[0]}</Typography>
                      </Box>
                    </Box>
                  </>}
                  {feed.text?.trim() && (feed.type !== 'TEXT') && (
                      <Box sx={{ pt: 1 }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                          {feed.text}
                        </Typography>
                      </Box>
                    )}
                  <CardActions disableSpacing>
                    <IconButton onClick={() => handleLikeFeed(feed.id, feed.likedByCurrentUser)} aria-label="like" color={feed.likedByCurrentUser ? 'error' : 'default'}>
                      {feed.likedByCurrentUser ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {feed.likeCount}
                    </Typography>
                    {/* Comment button and count on the left */}
                    <IconButton onClick={() => handleCommentClick(feed)} aria-label="comment" sx={{ ml: 1 }}>
                      <ChatBubbleOutlineIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {feed.commentCount ?? 0}
                    </Typography>
                    {/* Spacer pushes bookmark and share to the right */}
                    <Box sx={{ flexGrow: 1 }} />
                    {/* Add bookmark button next to share */}
                    {feed.type === 'RECIPE' && feed.recipe && (
                      <IconButton 
                        onClick={() => handleBookmarkRecipe(feed.recipe.id, feed.savedByCurrentUser)} 
                        aria-label="bookmark" 
                        color={feed.savedByCurrentUser ? 'primary' : 'default'}
                        sx={{ mr: 1 }}
                      >
                        {feed.savedByCurrentUser ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                    )}
                    {/* Add share button at the right corner */}
                    {feed.type === 'RECIPE' && feed.recipe && (
                      <IconButton 
                        onClick={(event) => handleShareClick(event, feed.recipe.id, feed.recipe.title)} 
                        aria-label="share" 
                        color="info"
                      >
                        <ShareOutlinedIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
          {loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress/></Box>
          )}
          <div ref={loaderRef} />
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
              {t('recipes.createRecipe')}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
              {recipes.map((recipe) => (
                <Box
                  key={recipe.id || recipe.getId?.()} // Use ID directly if available, otherwise use getId()
                  onClick={() => handleRecipeSelect(recipe)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    pt: '100%',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0px 8px 24px rgba(0,0,0,0.10)',
                    },
                  }}
                >
                  <img
                    src={recipe.photo || recipe.getPhoto?.()} // Try direct property first, then method
                    alt={recipe.title || recipe.getTitle?.()} // Try direct property first, then method
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
                      {recipe.title || recipe.getTitle?.()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRecipeDialog} color="primary">
              {t('common.cancel')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog
          open={commentDialogOpen}
          onClose={handleCloseComments}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxHeight: '90vh',
              height: '90vh',
              maxWidth: '65%',
              margin: 'auto',
              overflowY: 'hidden'
            }
          }}
          sx={{
            '& .MuiDialog-paper': {
              overflowY: 'hidden',
              display: 'flex'
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            height: '100%',
            position: 'relative'
          }}>
            {/* Close button */}
            <IconButton 
              onClick={handleCloseComments} 
              aria-label="close comments"
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                zIndex: 1,
                bgcolor: 'background.paper',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
                '&:hover': { bgcolor: 'background.default' }
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Left side - Post content */}
            <Box sx={{ 
              width: '61%', 
              p: 3, 
              borderRight: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                {t('userProfile.postHeader')}
              </Typography>
              
              {commentFeed && (
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Post title */}
                  {commentFeed.recipe && (
                    <Typography variant="h5" gutterBottom>
                      {commentFeed.recipe.title}
                    </Typography>
                  )}
                  
                  {/* Post image */}
                  {commentFeed.recipe?.photo && (
                    <Box sx={{ 
                      position: 'relative', 
                      mb: 2,
                      flex: '1 0 auto',
                      maxHeight: 'calc(100% - 200px)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Box 
                        component="img" 
                        src={commentFeed.recipe.photo} 
                        alt={commentFeed.recipe.title || "Recipe"}
                        sx={{ 
                          width: '100%', 
                          borderRadius: 1,
                          objectFit: 'contain',
                          maxHeight: '100%'
                        }} 
                      />
                      {commentFeed.recipe?.instructions && commentFeed.recipe.instructions.length > 0 && (
                        <Box sx={{ 
                          position: 'relative', 
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          p: 2,
                          borderBottomLeftRadius: 1,
                          borderBottomRightRadius: 1,
                        }}>
                          <Typography variant="body2">
                            {commentFeed.recipe.instructions[0]}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                  {commentFeed.image && (
                    <Box sx={{
                      mb: 2,
                      flex: '1 0 auto',
                      maxHeight: 'calc(100% - 200px)',
                      overflow: 'hidden',
                      borderRadius: 1
                    }}>
                      <Box 
                        component="img" 
                        src={commentFeed.image} 
                        alt="Post"
                        sx={{ 
                          width: '100%', 
                          objectFit: 'contain',
                          maxHeight: '100%'
                        }} 
                      />
                    </Box>
                  )}
                  
                  {/* Post text */}
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {commentFeed.text}
                  </Typography>

                  {/* Like button with no gap */}
                  <Box sx={{ 
                    position: 'relative', 
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0
                  }}>
                    <IconButton 
                      onClick={() => handleLikeFeed(commentFeed.id, commentFeed.likedByCurrentUser)} 
                      aria-label="like" 
                      color={commentFeed.likedByCurrentUser ? 'error' : 'default'}
                    >
                      {commentFeed.likedByCurrentUser ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {commentFeed.likeCount || 0}
                    </Typography>

                    {/* Only show bookmark button for recipe posts */}
                    {commentFeed.type === 'RECIPE' && commentFeed.recipe && (
                      <IconButton 
                        onClick={() => handleBookmarkRecipe(commentFeed.recipe.id, commentFeed.savedByCurrentUser)} 
                        aria-label="bookmark" 
                        color={commentFeed.savedByCurrentUser ? 'primary' : 'default'}
                      >
                        {commentFeed.savedByCurrentUser ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                    )}
                    
                    {/* Add share button for recipe posts in popup */}
                    {commentFeed.type === 'RECIPE' && commentFeed.recipe && (
                      <IconButton 
                        onClick={(event) => handleShareClick(event, commentFeed.recipe.id, commentFeed.recipe.title)} 
                        aria-label="share" 
                        color="info"
                        sx={{ ml: 1 }}
                      >
                        <ShareOutlinedIcon />
                      </IconButton>
                    )}
                    
                    {commentFeed.recipe && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => navigate(`/recipe/${commentFeed.recipe.id}`)}
                        sx={{ ml: 'auto', mr: 2, mt: -1 }}
                      >
                        {t('recipes.recipeDetail')}
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            
            {/* Right side - Comments */}
            <Box sx={{ 
              width: '39%', 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%'
            }}>
              <Box sx={{ 
                p: 3, 
                borderBottom: `1px solid ${theme.palette.divider}`, 
                bgcolor: 'primary.main'
              }}>
                <Typography variant="h6" color="primary.contrastText">{t('userProfile.commentsSection')}</Typography>
              </Box>
              
              <Box sx={{ 
                flex: 1, 
                overflow: 'hidden',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: 0
              }}>
                {commentsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : comments.length > 0 ? comments.map((comment, i) => (
          <Box key={i} sx={{ p: 2, borderRadius: 1, bgcolor: 'background.paper', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={() => { handleCloseComments(); navigate(`/user/${comment.userId}`); }}>
                      <Avatar src={comment.profilePhoto} sx={{ width: 32, height: 32, mr: 1 }} />
                      <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {comment.name} {comment.surname}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{comment.message}</Typography>
                    {comment.createdAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )) : (
                  <Typography color="text.secondary" sx={{ p: 2 }}>{t('userProfile.noComments')}</Typography>
                )}
              </Box>
              
              <Box component="form" onSubmit={handlePostComment} sx={{ 
                p: 3, 
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                mt: 'auto'
              }}>
                <TextField
                  label={t('userProfile.addComment')}
                  fullWidth
                  multiline
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 1 }}
                  disabled={commentsLoading}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  disabled={commentsLoading || !newComment.trim()}
                >
                  {commentsLoading ? <CircularProgress size={24} color="inherit" /> : t('userProfile.postComment')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Dialog>

        {/* Share Menu */}
        <Menu
          anchorEl={shareAnchorEl}
          open={Boolean(shareAnchorEl)}
          onClose={handleShareClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <MenuItem onClick={copyLinkToClipboard} dense>
            <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
            {t('recipes.copyLink')}
          </MenuItem>
          <MenuItem onClick={() => shareToSocial('facebook')} dense>
            <FacebookIcon fontSize="small" sx={{ mr: 1 }} />
            {t('recipes.shareToFacebook')}
          </MenuItem>
          <MenuItem onClick={() => shareToSocial('twitter')} dense>
            <TwitterIcon fontSize="small" sx={{ mr: 1 }} />
            {t('recipes.shareToTwitter')}
          </MenuItem>
          <MenuItem onClick={() => shareToSocial('whatsapp')} dense>
            <WhatsAppIcon fontSize="small" sx={{ mr: 1 }} />
            {t('recipes.shareToWhatsApp')}
          </MenuItem>
        </Menu>

        {/* Add Snackbar for share feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </Template>
  );
};

export default HomePage;

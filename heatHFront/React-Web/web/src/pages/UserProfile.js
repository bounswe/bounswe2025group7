import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Avatar, Divider, 
  IconButton, Card, CardActions, CircularProgress,
  Menu, MenuItem, Button, Dialog, TextField
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Template from '../components/Template';
import apiClient, { saveRecipe, unsaveRecipe } from '../services/apiClient';
import Snackbar from '@mui/material/Snackbar';

// Header section styling
const ProfileHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
}));

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // States for user data
  const [profileData, setProfileData] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for interactions
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentFeed, setCommentFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // States for sharing
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [recipeToShare, setRecipeToShare] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch user profile data
    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
          try {
            setLoading(true);
            // Use the correct API endpoint that returns user profile data
            const response = await apiClient.get(`/feeds/other-user?userId=${userId}`);
            
            // Extract user data and feeds from response
            const { name, surname, profilePhoto, feeds: userFeeds } = response.data;
            
            // Set profile data
            setProfileData({ name, surname, profilePhoto });
            
            // Process feeds to include UI state flags
            const processedFeeds = userFeeds.map(feed => ({
              ...feed,
              likedByCurrentUser: false, // Will be updated later if needed
              savedByCurrentUser: feed.type === 'RECIPE' && feed.recipe ? false : undefined // Only for recipes
            }));
            
            setFeeds(processedFeeds);
          } catch (err) {
            console.error("Error fetching user profile:", err);
            setError("Failed to load user profile. Please try again.");
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserProfile();
      }, [userId]);

   

  // Toggle like/unlike for a feed
  const handleLikeFeed = async (feedId, currentlyLiked) => {
    const newLiked = !currentlyLiked;
    
    // Optimistically update UI for feeds
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
      
      // Revert on error
      setFeeds(prev => prev.map(f => 
        f.id === feedId
          ? { ...f, likedByCurrentUser: currentlyLiked, likeCount: f.likeCount + (currentlyLiked ? 1 : -1) }
          : f
      ));
      
      if (commentFeed && commentFeed.id === feedId) {
        setCommentFeed(prev => ({
          ...prev,
          likedByCurrentUser: currentlyLiked,
          likeCount: (prev.likeCount || 0) + (currentlyLiked ? 1 : -1)
        }));
      }
      
      setSnackbarMessage('Failed to update like status');
      setSnackbarOpen(true);
    }
  };

  // Toggle bookmark/unbookmark for a recipe
  const handleBookmarkRecipe = async (recipeId, currentlySaved) => {
    try {
      // Optimistically update UI for feeds
      setFeeds(prev => prev.map(f => 
        f.type === 'RECIPE' && f.recipe?.id === recipeId
          ? { ...f, savedByCurrentUser: !currentlySaved }
          : f
      ));
      
      // Also update commentFeed if the same recipe is open in dialog
      if (commentFeed && commentFeed.type === 'RECIPE' && commentFeed.recipe?.id === recipeId) {
        setCommentFeed(prev => ({
          ...prev,
          savedByCurrentUser: !currentlySaved
        }));
      }
      
      // Call API to save/unsave recipe
      if (currentlySaved) {
        await unsaveRecipe(recipeId);
      } else {
        await saveRecipe(recipeId);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      
      // Revert on error
      setFeeds(prev => prev.map(f => 
        f.type === 'RECIPE' && f.recipe?.id === recipeId
          ? { ...f, savedByCurrentUser: currentlySaved }
          : f
      ));
      
      if (commentFeed && commentFeed.type === 'RECIPE' && commentFeed.recipe?.id === recipeId) {
        setCommentFeed(prev => ({
          ...prev,
          savedByCurrentUser: currentlySaved
        }));
      }
      
      setSnackbarMessage('Failed to update bookmark status');
      setSnackbarOpen(true);
    }
  };

  // Handle comment click - open dialog and fetch comments
  const handleCommentClick = async (feed) => {
    setCommentFeed(feed);
    setComments([]);  // Clear comments initially
    setNewComment('');
    setCommentDialogOpen(true);
    setCommentsLoading(true);
    
    // Fetch comments from the backend
    try {
      const response = await apiClient.get('/feeds/get-feed-comments', { 
        params: { feedId: feed.id }
      });
      if (response.data) {
        setComments(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setSnackbarMessage("Failed to load comments. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Close comment dialog
  const handleCloseComments = () => {
    setCommentDialogOpen(false);
  };

  // Submit new comment
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
      const response = await apiClient.get('/feeds/get-feed-comments', { 
        params: { feedId: commentFeed.id }
      });
      
      if (response.data) {
        setComments(response.data);
      }
      
      // Update comment count in the feeds list
      setFeeds(prev => prev.map(feed =>
        feed.id === commentFeed.id
          ? { ...feed, commentCount: (feed.commentCount || 0) + 1 }
          : feed
      ));
      
    } catch (err) {
      console.error('Failed to post comment:', err);
      setSnackbarMessage("Failed to post comment. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Handle share functionality
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
        setSnackbarMessage("Recipe link copied to clipboard!");
        setSnackbarOpen(true);
        handleShareClose();
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        setSnackbarMessage("Failed to copy link. Please try again.");
        setSnackbarOpen(true);
      });
  };

  const shareToSocial = (platform) => {
    if (!recipeToShare) return;
    
    const recipeUrl = `${window.location.origin}/recipe/${recipeToShare.id}`;
    const recipeTitle = recipeToShare.title || 'Check out this recipe!';
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

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Template>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Template>
    );
  }

  if (error || !profileData) {
    return (
      <Template>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
          <Typography color="error" gutterBottom>{error || "User not found"}</Typography>
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Box>
      </Template>
    );
  }

  return (
    <Template>
      {/* Profile Header */}
      <ProfileHeader>
        <Container maxWidth="md">
          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <Avatar 
              src={profileData.profilePhoto} 
              alt={`${profileData.name} ${profileData.surname}`}
              sx={{ width: 150, height: 150, mb: 2, boxShadow: 3 }}
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {profileData.name} {profileData.surname}
            </Typography>
          </Box>
        </Container>
      </ProfileHeader>

      {/* User's Feeds */}
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Posts
        </Typography>

        {feeds.length === 0 ? (
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              This user hasn't posted anything yet.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {feeds.map((feed) => (
              <Card key={feed.id} sx={{ width: '100%', boxShadow: 2, '&:hover': { boxShadow: 6 } }}>
                {/* Text Feed */}
                {feed.type === 'TEXT' && 
                  <Box sx={{ p: 2 }}>
                    <Typography>{feed.text}</Typography>
                  </Box>
                }
                
                {/* Image Feed */}
                {feed.type === 'IMAGE_AND_TEXT' && 
                  <Box sx={{ p: 2 }}>
                    <Box component="img" src={feed.image} alt="feed" sx={{ width:'100%', mb: 1 }}/>
                    <Typography>{feed.text}</Typography>
                  </Box>
                }
                
                {/* Recipe Feed */}
                {feed.type === 'RECIPE' && feed.recipe && 
                  <>
                    <Typography variant="h6" sx={{ m: 2 }}>{feed.recipe.title}</Typography>
                    <Box 
                      onClick={() => navigate(`/recipe/${feed.recipe.id}`)} 
                      sx={{ 
                        position:'relative', 
                        width:'100%', 
                        pt:'100%', 
                        overflow:'hidden', 
                        cursor:'pointer', 
                        '&:hover .descOverlay': { 
                          opacity: 1, 
                          transform: 'translateY(0)' 
                        } 
                      }}
                    >
                      <img 
                        src={feed.recipe.photo} 
                        alt={feed.recipe.title} 
                        style={{ 
                          position: 'absolute', 
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover' 
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
                          transition: 'all 0.3s ease-in-out' 
                        }}
                      >
                        <Typography variant="body2">
                          {feed.recipe.instructions && feed.recipe.instructions[0]}
                        </Typography>
                      </Box>
                    </Box>
                    {feed.text && 
                      <Box sx={{ p: 2, pt: 1 }}>
                        <Typography>{feed.text}</Typography>
                      </Box>
                    }
                  </>
                }
                
                {/* Feed Footer - Date & Actions */}
                <Box sx={{ px: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(feed.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                
                <CardActions disableSpacing>
                  {/* Like button */}
                  <IconButton 
                    onClick={() => handleLikeFeed(feed.id, feed.likedByCurrentUser)} 
                    aria-label="like" 
                    color={feed.likedByCurrentUser ? 'error' : 'default'}
                  >
                    {feed.likedByCurrentUser ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {feed.likeCount || 0}
                  </Typography>
                  
                  {/* Comment button */}
                  <IconButton 
                    onClick={() => handleCommentClick(feed)}
                    aria-label="comment" 
                    sx={{ ml: 1 }}
                  >
                    <ChatBubbleOutlineIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {feed.commentCount || 0}
                  </Typography>
                  
                  {/* Bookmark button (only for recipes) */}
                  {feed.type === 'RECIPE' && feed.recipe && (
                    <IconButton 
                      onClick={() => handleBookmarkRecipe(feed.recipe.id, feed.savedByCurrentUser)} 
                      aria-label="bookmark" 
                      color={feed.savedByCurrentUser ? 'primary' : 'default'}
                      sx={{ ml: 1 }}
                    >
                      {feed.savedByCurrentUser ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  )}
                  
                  {/* Share button (only for recipes) */}
                  {feed.type === 'RECIPE' && feed.recipe && (
                    <IconButton 
                      onClick={(event) => handleShareClick(event, feed.recipe.id, feed.recipe.title)} 
                      aria-label="share" 
                      color="info"
                      sx={{ ml: 1 }}
                    >
                      <ShareOutlinedIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
      
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
              boxShadow: 1,
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
              Post
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

                {/* Action buttons */}
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
                      View Recipe
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
              <Typography variant="h6" color="primary.contrastText">Comments</Typography>
            </Box>
            
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {commentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : comments.length > 0 ? comments.map((comment, i) => (
                <Box key={i} sx={{ p: 2, borderRadius: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
                <Typography color="text.secondary" sx={{ p: 2 }}>No comments yet.</Typography>
              )}
            </Box>
            
            <Box component="form" onSubmit={handlePostComment} sx={{ 
              p: 3, 
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper'
            }}>
              <TextField
                label="Add a comment"
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
                {commentsLoading ? <CircularProgress size={24} color="inherit" /> : 'Post Comment'}
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
          Copy Link
        </MenuItem>
        <MenuItem onClick={() => shareToSocial('facebook')} dense>
          <FacebookIcon fontSize="small" sx={{ mr: 1 }} />
          Share to Facebook
        </MenuItem>
        <MenuItem onClick={() => shareToSocial('twitter')} dense>
          <TwitterIcon fontSize="small" sx={{ mr: 1 }} />
          Share to Twitter
        </MenuItem>
        <MenuItem onClick={() => shareToSocial('whatsapp')} dense>
          <WhatsAppIcon fontSize="small" sx={{ mr: 1 }} />
          Share via WhatsApp
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Template>
  );
};

export default UserProfile;
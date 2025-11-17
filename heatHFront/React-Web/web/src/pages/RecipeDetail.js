import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Box, IconButton, useTheme, Button, Rating,
  Chip, Divider, List, ListItem, ListItemText, Paper, Avatar,
  Table, TableBody, TableRow, TableCell
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import PrintIcon from '@mui/icons-material/Print';
import Template from '../components/Template';
import apiClient, { checkIfRecipeSaved, saveRecipe, unsaveRecipe } from '../services/apiClient';
import Snackbar from '@mui/material/Snackbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GrainIcon from '@mui/icons-material/Grain';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

// Recipe section styling
const RecipeDetailSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(0, 0, 3, 0),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
}));

// Recipe info box styling
const RecipeInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  background: alpha(theme.palette.primary.light, 0.05)
}));

// Simple table row component for nutrition
const NutrientRow = ({ label, value, unit = '', indent = 0, isSub = false, IconComponent = null }) => (
  <TableRow>
    <TableCell
      sx={{
        borderBottom: 'none',
        py: 0.5,
        pl: 2 + indent,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {IconComponent && (
          <IconComponent
            fontSize="small"
            color={isSub ? 'disabled' : 'primary'}
          />
        )}
        <Typography
          variant="body2"
          color={isSub ? 'text.secondary' : 'text.primary'}
        >
          {label}
        </Typography>
      </Box>
    </TableCell>
    <TableCell
      align="right"
      sx={{
        borderBottom: 'none',
        py: 0.5,
        pr: 2,
      }}
    >
      <Typography
        variant="body2"
        fontWeight={isSub ? 'normal' : 'medium'}
        color={isSub ? 'text.secondary' : 'text.primary'}
      >
        {value != null && value !== '' ? `${value} ${unit}`.trim() : '-'}
      </Typography>
    </TableCell>
  </TableRow>
);

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // States
  const [recipe, setRecipe] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  // Share functionality states - MOVED INSIDE COMPONENT
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Add these states inside your RecipeDetail component
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const nutrition = recipe && recipe["nutritionData"] ? recipe["nutritionData"] : null;

  // Fetch recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await apiClient.get(`/recipe/get?recipeId=${id}`);
        setRecipe(response.data);
        console.log('Fetched recipe:', response.data);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Add this effect to check if recipe is saved when the component loads
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (recipe?.id) {
        const savedStatus = await checkIfRecipeSaved(recipe.id);
        setIsSaved(savedStatus);
      }
    };

    fetchSavedStatus();
  }, [recipe]);

  const handlePrint = () => {
    window.print();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Share functionality handlers - MOVED INSIDE COMPONENT
  const handleShareClick = (event) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const copyLinkToClipboard = () => {
    const recipeUrl = window.location.href;
    navigator.clipboard.writeText(recipeUrl)
      .then(() => {
        setSnackbarMessage('Recipe link copied to clipboard!');
        setSnackbarOpen(true);
        handleShareClose();
      })
      .catch(err => {
        setSnackbarMessage('Failed to copy link. Please try again.');
        setSnackbarOpen(true);
        console.error('Could not copy text: ', err);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const shareToSocial = (platform) => {
    const recipeUrl = window.location.href;
    // Now recipe is properly in scope
    const recipeTitle = recipe?.title || 'Check out this recipe!';
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

  // Add this function to handle save/unsave actions
  const handleSaveToggle = async () => {
    if (!recipe?.id) return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        await unsaveRecipe(recipe.id);
        setSnackbarMessage('Recipe removed from saved items');
      } else {
        await saveRecipe(recipe.id);
        setSnackbarMessage('Recipe saved successfully!');
      }
      setIsSaved(!isSaved);
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Error saving recipe. Please try again.');
      setSnackbarOpen(true);
      console.error('Error toggling save status:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Template>
        <Container>
          <Typography variant="h5" sx={{ my: 4, textAlign: 'center' }}>
            Loading recipe...
          </Typography>
        </Container>
      </Template>
    );
  }

  if (!recipe) {
    return (
      <Template>
        <Container>
          <Typography variant="h5" sx={{ my: 4, textAlign: 'center' }}>
            Recipe not found
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Box>
        </Container>
      </Template>
    );
  }

  return (
    <Template>
      {/* Hero section with image and title overlay */}
      <Box sx={{ position: 'relative', height: '50vh', overflow: 'hidden' }}>
        <Box
          component="img"
          src={recipe["photo"]}
          alt={recipe["title"]}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: alpha(theme.palette.common.black, 0.7),
            color: 'white',
            p: 3,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              {recipe["title"]}
            </Typography>

            {recipe["tag"] && (
              <Chip
                label={recipe["tag"]}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Container>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Easiness Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={recipe.easinessScore || 3.5} readOnly precision={0.5} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                (3.5)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Healthiness Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={recipe.healthinessScore || 3.5} readOnly precision={0.5} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                (3.5)
              </Typography>
            </Box>
          </Box>

          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>

        {/* Tabs navigation - styled to match the image */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Box sx={{
            display: 'flex',
            maxWidth: '600px',
            width: '100%',
            justifyContent: 'space-evenly'
          }}>
            <Button
              onClick={() => handleTabChange('details')}
              sx={{
                color: activeTab === 'details' ? theme.palette.primary.main : 'text.secondary',
                borderBottom: activeTab === 'details' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                px: 3,
                py: 1,
                fontWeight: activeTab === 'details' ? 'bold' : 'normal'
              }}
            >
              Recipe Details
            </Button>
            <Button
              onClick={() => handleTabChange('instructions')}
              sx={{
                color: activeTab === 'instructions' ? theme.palette.primary.main : 'text.secondary',
                borderBottom: activeTab === 'instructions' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                px: 3,
                py: 1,
                fontWeight: activeTab === 'instructions' ? 'bold' : 'normal'
              }}
            >
              Instructions
            </Button>
            <Button
              onClick={() => handleTabChange('ingredients')}
              sx={{
                color: activeTab === 'ingredients' ? theme.palette.primary.main : 'text.secondary',
                borderBottom: activeTab === 'ingredients' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                px: 3,
                py: 1,
                fontWeight: activeTab === 'ingredients' ? 'bold' : 'normal'
              }}
            >
              Ingredients
            </Button>
            <Button
              onClick={() => handleTabChange('save')}
              sx={{
                color: activeTab === 'save' ? theme.palette.primary.main : 'text.secondary',
                borderBottom: activeTab === 'save' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                px: 3,
                py: 1,
                fontWeight: activeTab === 'save' ? 'bold' : 'normal'
              }}
            >
              Save & Share
            </Button>
          </Box>
        </Box>

        {/* Conditionally render content based on active tab */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          my: 3
        }}>
          {/* Recipe details tab */}
          {activeTab === 'details' && (
            <Paper
            fullwidth
              elevation={1}
              sx={{
                p: 2.5,
                width: '100%',
                maxWidth: 720,
                mx: 'auto',
                bgcolor: alpha(theme.palette.background.default, 0.7),
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                Recipe Details
              </Typography>
              <Grid
                container
                spacing={2}
                direction="column"
                sx={{ mt: 1 }}
              >
                {recipe["type"] && (
                  <Grid item xs={12}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      p: 1.5,
                      height: '100%',
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      borderRadius: 1,
                    }}>
                      <LocalDiningIcon color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">{recipe["type"]}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {recipe["totalCalorie"] >= 0 && (
                  <Grid item xs={12}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      p: 1.5,
                      height: '100%',
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      borderRadius: 1,
                    }}>
                      <LocalDiningIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Calories</Typography>
                        <Typography variant="body2" fontWeight="medium">{recipe["totalCalorie"]} kcal</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {recipe["price"] > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      p: 1.5,
                      height: '100%',
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      borderRadius: 1,
                    }}>
                      <AttachMoneyIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Price</Typography>
                        <Typography variant="body2" fontWeight="medium">${recipe["price"]}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {nutrition && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1, fontWeight: 'bold' }}
                      >
                        Nutrition (per serving)
                      </Typography>
                      <Table size="small">
                        <TableBody>
                          {/* Carbs */}
                          {nutrition["carbs"] >= 0 && (
                            <NutrientRow
                              label="Carbohydrates"
                              value={nutrition["carbs"]}
                              unit="g"
                              IconComponent={GrainIcon}
                            />
                          )}

                          {/* Protein */}
                          {nutrition["protein"] >= 0 && (
                            <NutrientRow
                              label="Protein"
                              value={nutrition["protein"]}
                              unit="g"
                              IconComponent={FitnessCenterIcon}
                            />
                          )}

                          {/* Fat + sub-rows */}
                          {nutrition["fat"] >= 0 && (
                            <>
                              <NutrientRow
                                label="Fat"
                                value={nutrition["fat"]}
                                unit="g"
                                IconComponent={WaterDropIcon}
                              />

                              {nutrition["cholesterol"] >= 0 && (
                                <NutrientRow
                                  label="Cholesterol"
                                  value={nutrition["cholesterol"]}
                                  unit="mg"
                                  indent={8}
                                  isSub
                                  IconComponent={WaterDropIcon}
                                />
                              )}

                              {nutrition["saturatedFat"] >= 0 && (
                                <NutrientRow
                                  label="Saturated fat"
                                  value={nutrition["saturatedFat"]}
                                  unit="g"
                                  indent={8}
                                  isSub
                                  IconComponent={WaterDropIcon}
                                />
                              )}

                              {(nutrition["monounsaturated_fat"] >= 0 ||
                                nutrition["polyunsaturated_fat"] >= 0) && (
                                <NutrientRow
                                  label="Unsaturated fat"
                                  value={[
                                    nutrition["monounsaturated_fat"] >= 0
                                      ? `${nutrition["monounsaturated_fat"]} g mono`
                                      : null,
                                    nutrition["polyunsaturated_fat"] >= 0
                                      ? `${nutrition["polyunsaturated_fat"]} g poly`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(' + ')}
                                  unit=""
                                  indent={8}
                                  isSub
                                  IconComponent={WaterDropIcon}
                                />
                              )}
                            </>
                          )}

                          {/* Vitamins group */}
                          {(nutrition["vitamin_a"] >= 0 || nutrition["vitamin_c"] >= 0) && (
                            <>
                              <NutrientRow label="Vitamins" value="" unit="" />

                              {nutrition["vitamin_a"] >= 0 && (
                                <NutrientRow
                                  label="Vitamin A"
                                  value={nutrition["vitamin_a"]}
                                  unit="% DV"
                                  indent={8}
                                  isSub
                                  IconComponent={GrainIcon}
                                />
                              )}

                              {nutrition["vitamin_c"] >= 0 && (
                                <NutrientRow
                                  label="Vitamin C"
                                  value={nutrition["vitamin_c"]}
                                  unit="% DV"
                                  indent={8}
                                  isSub
                                  IconComponent={GrainIcon}
                                />
                              )}
                            </>
                          )}

                          {/* Iron */}
                          {nutrition["iron"] >= 0 && (
                            <NutrientRow
                              label="Iron"
                              value={nutrition["iron"]}
                              unit="mg"
                              IconComponent={FitnessCenterIcon}
                            />
                          )}

                          {/* Calcium */}
                          {nutrition["calcium"] >= 0 && (
                            <NutrientRow
                              label="Calcium"
                              value={nutrition["calcium"]}
                              unit="mg"
                              IconComponent={FitnessCenterIcon}
                            />
                          )}

                          {/* The rest */}
                          {nutrition["fiber"] >= 0 && (
                            <NutrientRow
                              label="Fiber"
                              value={nutrition["fiber"]}
                              unit="g"
                              IconComponent={GrainIcon}
                            />
                          )}

                          {nutrition["sugar"] >= 0 && (
                            <NutrientRow
                              label="Sugar"
                              value={nutrition["sugar"]}
                              unit="g"
                              IconComponent={GrainIcon}
                            />
                          )}

                          {nutrition["potassium"] >= 0 && (
                            <NutrientRow
                              label="Potassium"
                              value={nutrition["potassium"]}
                              unit="mg"
                              IconComponent={FitnessCenterIcon}
                            />
                          )}

                          {nutrition["sodium"] >= 0 && (
                            <NutrientRow
                              label="Sodium"
                              value={nutrition["sodium"]}
                              unit="mg"
                              IconComponent={FitnessCenterIcon}
                            />
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </Grid>
                )}


              </Grid>
            </Paper>
          )}

          {/* Instructions tab */}
          {activeTab === 'instructions' && (
            <Paper
              fullwidth
              elevation={1}
              sx={{
                p: 3,
                width: '100%',
                bgcolor: alpha(theme.palette.background.default, 0.7)
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                Instructions
              </Typography>
              <Box>
                {recipe["instructions"].map((instruction) => (
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Box
                      sx={{
                        minWidth: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        mt:1,
                        fontWeight: 'bold',
                        flexShrink: 0,
                        fontSize: '5.75rem'
                      }}
                    >

                    </Box>
                    <Typography variant="body1">
                      {instruction}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Ingredients tab */}
          {activeTab === 'ingredients' && (
            <Paper
              fullwidth
              elevation={1}
              sx={{
                p: 3,
                width: '100%',
                bgcolor: alpha(theme.palette.background.default, 0.7)
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                Ingredients
              </Typography>
              {recipe["ingredients"] && recipe["ingredients"].length > 0 ? (
                <List disablePadding>
                  {recipe["ingredients"].map((ingredientStr, idx) => {
                    const name = ingredientStr["name"] ? ingredientStr["name"] : "";
                    const amount = ingredientStr["quantity"] ? ingredientStr["quantity"] : "";
                    return (
                      <ListItem
                        key={idx}
                        disablePadding
                        divider={idx < recipe["ingredients"].length - 1}
                        sx={{ py: 1 }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="body1" fontWeight="medium">{name}</Typography>
                          <Typography variant="body1" color="text.secondary">{amount}</Typography>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No ingredients listed
                </Typography>
              )}
            </Paper>
          )}

          {/* Save & Share tab */}
          {activeTab === 'save' && (
            <Paper
            fullwidth
              elevation={1}
              sx={{
                p: 3,
                width: '100%',
                bgcolor: alpha(theme.palette.background.default, 0.7)
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                Save & Share
              </Typography>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-around',
                mt: 5,
                mb: 2,
                height: '10px',
                alignItems: 'center'
              }}>
                {/* <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconButton color="error" sx={{ mb: 1, p: 2 }}>
                    <FavoriteIcon fontSize="large" />
                  </IconButton>
                  <Typography color="error" variant="body2">Like</Typography>
                </Box> */}

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconButton
                    onClick={handleSaveToggle}
                    disabled={saveLoading}
                    sx={{
                      mb: 1,
                      p: 1,
                      color: isSaved ? 'primary.main' : 'text.secondary',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: isSaved ? 'primary.light' : alpha(theme.palette.primary.light, 0.1),
                        color: isSaved ? 'white' : 'primary.main',
                      },
                      '&:active': {
                        backgroundColor: 'primary.dark',
                        transform: 'scale(0.95)',
                      }
                    }}
                  >
                    {isSaved ? (
                      <BookmarkIcon fontSize="large" />
                    ) : (
                      <BookmarkBorderIcon fontSize="large" />
                    )}
                  </IconButton>
                  <Typography
                    color={isSaved ? "primary" : "text.secondary"}
                    variant="body2"
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconButton
                    color="info"
                    sx={{
                      mb: 1, p: 1,
                      color: 'info.main',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'info.light',
                        color: 'white',
                      },
                      '&:active': {
                        backgroundColor: 'info.dark',
                        transform: 'scale(0.50)',
                      }
                    }}
                    onClick={handleShareClick}
                  >
                    <ShareIcon fontSize="large" />
                  </IconButton>
                  <Typography color="info" variant="body2">Share</Typography>
                </Box>
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

                <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={3000}
                  onClose={handleSnackbarClose}
                  message={snackbarMessage}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </Template>
  );
};

export default RecipeDetail;
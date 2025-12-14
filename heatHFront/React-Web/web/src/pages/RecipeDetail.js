import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container, Typography, Grid, Box, IconButton, useTheme, Button, Rating,
  Chip, Divider, List, ListItem, ListItemText, Paper, Avatar,
  Table, TableBody, TableRow, TableCell, Alert
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
import { mapLanguageToRecipeTarget, translateRecipeContent } from '../services/recipeTranslation';
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
import ScienceIcon from '@mui/icons-material/Science';
import HealingIcon from '@mui/icons-material/Healing';

const LANGUAGE_LABEL_KEYS = {
  en: 'common.english',
  tr: 'common.turkish',
  ja: 'common.japanese',
};

const UNIT_LABELS = {
  GRAM: 'g',
  ML: 'ml',
  TEASPOON: 'tsp',
  TABLESPOON: 'tbsp',
  CUP: 'cup',
};

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
  const { t, i18n } = useTranslation();

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
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const [averageEasinessScore, setAverageEasinessScore] = useState(null);
  const [easinessRatingLoading, setEasinessRatingLoading] = useState(false);
  const [userEasinessRate, setUserEasinessRate] = useState(null);
  const nutrition = recipe && recipe["nutritionData"] ? recipe["nutritionData"] : null;

  const targetLanguage = mapLanguageToRecipeTarget(i18n.language || 'en');
  const targetLanguageLabelKey = LANGUAGE_LABEL_KEYS[targetLanguage] || LANGUAGE_LABEL_KEYS.en;

  const normalizeIngredient = (ingredientItem) => {
    if (typeof ingredientItem === 'string') {
      const [rawName, rawRest] = ingredientItem.split(':').map(part => part.trim());
      const [amountPart, unitPart] = (rawRest || '').split(' ').filter(Boolean);
      return {
        name: rawRest ? rawName : ingredientItem,
        quantity: amountPart || '',
        type: unitPart ? unitPart.toUpperCase() : undefined,
        fallback: ingredientItem,
      };
    }
    return ingredientItem || {};
  };

  const formatIngredientAmount = (ingredient) => {
    if (!ingredient) return '';
    const quantity = ingredient.quantity ?? ingredient.amount;
    const unit = ingredient.type;

    if (quantity !== undefined && quantity !== null && quantity !== '') {
      const unitLabel = unit ? (UNIT_LABELS[unit] || unit.toLowerCase()) : '';
      return `${quantity}${unitLabel ? ` ${unitLabel}` : ''}`.trim();
    }

    return '';
  };

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

  // Fetch average easiness score when recipe loads
  useEffect(() => {
    const fetchAverageEasinessScore = async () => {
      if (!recipe?.id) return;
      
      try {
        const response = await apiClient.post('/recipe/average-easiness-rate', {
          recipeId: recipe.id
        });
        console.log('Initial average easiness response:', response.data);
        // Response structure: { averageEasinessRate: number }
        const averageScore = response.data?.averageEasinessRate;
        console.log('Initial parsed average score:', averageScore);
        // Always use the average score from API
        if (averageScore !== null && averageScore !== undefined) {
          setAverageEasinessScore(averageScore);
        } else {
          setAverageEasinessScore(null);
        }
      } catch (error) {
        console.error("Error fetching average easiness score:", error);
        // Set to null if there's an error or no ratings yet
        setAverageEasinessScore(null);
      }
    };

    fetchAverageEasinessScore();
  }, [recipe?.id]);

  // Fetch user's own easiness rate when recipe loads
  useEffect(() => {
    const fetchUserEasinessRate = async () => {
      if (!recipe?.id) return;
      
      try {
        const response = await apiClient.get(`/recipe/get-easiness-rate-by-user?recipeId=${recipe.id}`);
        console.log('User easiness rate response:', response.data);
        // Response structure: { easinessRate: number | null }
        const userRate = response.data?.easinessRate;
        console.log('Parsed user easiness rate:', userRate);
        if (userRate !== null && userRate !== undefined) {
          setUserEasinessRate(userRate);
        } else {
          setUserEasinessRate(null);
        }
      } catch (error) {
        console.error("Error fetching user easiness rate:", error);
        // Set to null if there's an error or no rating yet
        setUserEasinessRate(null);
      }
    };

    fetchUserEasinessRate();
  }, [recipe?.id]);

  // Translate recipe content
  useEffect(() => {
    if (!recipe) return;

    let cancelled = false;
    const translateContent = async () => {
      setIsTranslating(true);
      setTranslationError(null);
      setTranslatedContent(null);

      const content = {
        title: recipe.title,
        description: recipe.description,
        tag: recipe.tag,
        type: recipe.type,
        ingredients: recipe.ingredients
          ? recipe.ingredients.map((ingredient) =>
              typeof ingredient === 'string' ? ingredient : { ...ingredient }
            )
          : undefined,
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : undefined,
      };

      try {
        const translated = await translateRecipeContent(
          `recipe-${recipe.id}`,
          content,
          targetLanguage
        );
        if (!cancelled) {
          setTranslatedContent(translated);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error translating recipe content', error);
          setTranslationError(error);
        }
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
        }
      }
    };

    translateContent();

    return () => {
      cancelled = true;
    };
  }, [recipe, targetLanguage]);

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
        setSnackbarMessage(t('recipes.linkCopied'));
        setSnackbarOpen(true);
        handleShareClose();
      })
      .catch(err => {
        setSnackbarMessage(t('recipes.linkCopyFailed'));
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
    const recipeTitle = recipe?.title || t('recipes.checkOutRecipe');
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
        setSnackbarMessage(t('recipes.recipeUnsaved'));
      } else {
        await saveRecipe(recipe.id);
        setSnackbarMessage(t('recipes.recipeSaved'));
      }
      setIsSaved(!isSaved);
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(t('recipes.saveError'));
      setSnackbarOpen(true);
      console.error('Error toggling save status:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle easiness rating change
  const handleEasinessRatingChange = async (event, newValue) => {
    if (!recipe?.id || !newValue) return;

    // Only allow whole numbers (1, 2, 3, 4, 5)
    // Check if the clicked value is a whole number (with small tolerance for floating point)
    const roundedValue = Math.round(newValue);
    
    // If the clicked value is not a whole number, completely ignore it
    // This prevents half-star selections - user can only click on full stars
    if (Math.abs(newValue - roundedValue) > 0.01) {
      // User clicked on half star - ignore completely
      // The Rating component's value prop won't change, so visually nothing happens
      return;
    }

    setEasinessRatingLoading(true);
    
    try {
      await apiClient.post('/recipe/rate-easiness', {
        recipeId: recipe.id,
        easinessRate: roundedValue
      });
      
      // Fetch updated average score after rating
      const averageResponse = await apiClient.post('/recipe/average-easiness-rate', {
        recipeId: recipe.id
      });
      console.log('Average easiness response:', averageResponse.data);
      const averageScore = averageResponse.data?.averageEasinessRate;
      console.log('Parsed average score:', averageScore);
      // Always update with the average score from API (not the user's individual rating)
      if (averageScore !== null && averageScore !== undefined) {
        setAverageEasinessScore(Number(averageScore));
      } else {
        setAverageEasinessScore(null);
      }

      // Fetch updated user's own rating after rating
      const userRateResponse = await apiClient.get(`/recipe/get-easiness-rate-by-user?recipeId=${recipe.id}`);
      console.log('User easiness rate response after rating:', userRateResponse.data);
      const userRate = userRateResponse.data?.easinessRate;
      if (userRate !== null && userRate !== undefined) {
        setUserEasinessRate(userRate);
      } else {
        setUserEasinessRate(null);
      }
      
      setSnackbarMessage(t('recipes.easinessRated'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting easiness rating:', error);
      setSnackbarMessage(t('recipes.ratingError'));
      setSnackbarOpen(true);
      // On error, don't change the average score - it will stay as it was
    } finally {
      setEasinessRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <Template>
        <Container>
          <Typography variant="h5" sx={{ my: 4, textAlign: 'center' }}>
            {t('recipes.loadingRecipe')}
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
            {t('recipes.recipeNotFound')}
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              {t('common.back')}
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
          alt={translatedContent?.title || recipe["title"]}
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
              {translatedContent?.title || recipe["title"]}
            </Typography>

            {(translatedContent?.tag || recipe["tag"]) && (
              <Chip
                label={translatedContent?.tag || recipe["tag"]}
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
        {(isTranslating || translationError) && (
          <Box sx={{ mb: 2 }}>
            {isTranslating && (
              <Alert severity="info">
                {t('recipes.translationInProgress', { language: t(targetLanguageLabelKey) })}
              </Alert>
            )}
            {translationError && (
              <Alert severity="warning" sx={{ mt: isTranslating ? 1 : 0 }}>
                {t('recipes.translationFailed')}
              </Alert>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            {t('common.back')}
          </Button>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('recipes.easinessScore')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Rating 
                value={averageEasinessScore !== null ? averageEasinessScore : 0} 
                readOnly
                precision={0.1}
                max={5}
                sx={{ mb: 0.5 }}
              />
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {averageEasinessScore !== null 
                  ? `(${averageEasinessScore.toFixed(1)}/5)` 
                  : '(0/5)'}
              </Typography>
            </Box>
            {/* User's own easiness rate */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('recipes.yourEasinessRating')}
              </Typography>
              <Rating 
                value={userEasinessRate !== null ? userEasinessRate : 0} 
                onChange={handleEasinessRatingChange}
                precision={1}
                max={5}
                disabled={easinessRatingLoading}
                sx={{ mb: 0.5 }}
              />
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {userEasinessRate !== null 
                  ? `(${userEasinessRate}/5)` 
                  : '(Not rated)'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('recipes.healthinessScore')}
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
            {t('recipes.print')}
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
              {t('recipes.recipeDetail')}
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
              {t('recipes.instructions')}
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
              {t('recipes.ingredients')}
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
              {t('recipes.saveAndShare')}
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
                {t('recipes.recipeDetail')}
              </Typography>
              <Grid
                container
                spacing={2}
                direction="column"
                sx={{ mt: 1 }}
              >
                {(translatedContent?.type || recipe["type"]) && (
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
                        <Typography variant="body2" fontWeight="medium">{translatedContent?.type || recipe["type"]}</Typography>
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
                        <Typography variant="caption" color="text.secondary">{t('recipes.calories')}</Typography>
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
                        <Typography variant="caption" color="text.secondary">{t('recipes.price')}</Typography>
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
                        {t('recipes.nutritionPerServing') || 'Nutrition (per serving)'}
                      </Typography>
                      <Table size="small">
                        <TableBody>
                          {/* Carbs */}
                          {nutrition["carbs"] >= 0 && (
                            <NutrientRow
                              label={t('recipes.carbohydrates')}
                              value={nutrition["carbs"]}
                              unit="g"
                              IconComponent={GrainIcon}
                            />
                          )}

                          {/* Protein */}
                          {nutrition["protein"] >= 0 && (
                            <NutrientRow
                              label={t('recipes.protein')}
                              value={nutrition["protein"]}
                              unit="g"
                              IconComponent={FitnessCenterIcon}
                            />
                          )}

                          {/* Fat + sub-rows */}
                          {nutrition["fat"] >= 0 && (
                            <>
                              <NutrientRow
                                label={t('recipes.fat')}
                                value={nutrition["fat"]}
                                unit="g"
                                IconComponent={WaterDropIcon}
                              />

                              {nutrition["cholesterol"] >= 0 && (
                                <NutrientRow
                                  label={t('recipes.cholesterol') || 'Cholesterol'}
                                  value={nutrition["cholesterol"]}
                                  unit="mg"
                                  indent={8}
                                  isSub
                                  IconComponent={WaterDropIcon}
                                />
                              )}

                              {nutrition["saturatedFat"] >= 0 && (
                                <NutrientRow
                                  label={t('recipes.saturatedFat') || 'Saturated fat'}
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
                                  label={t('recipes.unsaturatedFat') || 'Unsaturated fat'}
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
                          {(nutrition["vitaminA"] >= 0 || nutrition["vitaminC"] >= 0) && (
                            <>
                              <NutrientRow label={t('recipes.vitamins') || 'Vitamins'} value="" unit="" IconComponent={HealingIcon} />

                              {nutrition["vitaminA"] >= 0 && (
                                <NutrientRow
                                  label={t('recipes.vitaminA') || 'Vitamin A'}
                                  value={nutrition["vitaminA"]}
                                  unit="% DV"
                                  indent={8}
                                  isSub
                                  IconComponent={HealingIcon}
                                />
                              )}

                              {nutrition["vitaminC"] >= 0 && (
                                <NutrientRow
                                  label={t('recipes.vitaminC') || 'Vitamin C'}
                                  value={nutrition["vitaminC"]}
                                  unit="% DV"
                                  indent={8}
                                  isSub
                                  IconComponent={HealingIcon}
                                />
                              )}
                            </>
                          )}

                          {/* Iron */}
                          {nutrition["iron"] >= 0 && (
                            <NutrientRow
                              label={t('recipes.iron') || 'Iron'}
                              value={nutrition["iron"]}
                              unit="mg"
                              IconComponent={ScienceIcon}
                            />
                          )}

                          {/* Calcium */}
                          {nutrition["calcium"] >= 0 && (
                            <NutrientRow
                              label={t('recipes.calcium') || 'Calcium'}
                              value={nutrition["calcium"]}
                              unit="mg"
                              IconComponent={ScienceIcon}
                            />
                          )}

                          {nutrition["potassium"] >= 0 && (
                            <NutrientRow
                              label={t('recipes.potassium') || 'Potassium'}
                              value={nutrition["potassium"]}
                              unit="mg"
                              IconComponent={ScienceIcon}
                            />
                          )}

                          {nutrition["sodium"] >= 0 && (
                            <NutrientRow
                              label={t('recipes.sodium') || 'Sodium'}
                              value={nutrition["sodium"]}
                              unit="mg"
                              IconComponent={ScienceIcon}
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
                {t('recipes.instructions')}
              </Typography>
              <Box>
                {(() => {
                  const instructionsToShow = translatedContent?.instructions || (Array.isArray(recipe["instructions"]) ? recipe["instructions"] : []);
                  return instructionsToShow.length > 0 ? (
                    instructionsToShow.map((instruction, idx) => (
                      <Box key={`instruction-${idx}`} sx={{ display: 'flex', mb: 3 }}>
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
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      {t('recipes.noInstructions')}
                    </Typography>
                  );
                })()}
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
                {t('recipes.ingredients')}
              </Typography>
              {(() => {
                const ingredientsToShow = translatedContent?.ingredients || (Array.isArray(recipe["ingredients"]) ? recipe["ingredients"] : []);
                return ingredientsToShow.length > 0 ? (
                  <List disablePadding>
                    {ingredientsToShow.map((ingredientItem, idx) => {
                      const normalizedIngredient = normalizeIngredient(ingredientItem);
                      const name = normalizedIngredient.name || normalizedIngredient.fallback || '';
                      const amountLabel = formatIngredientAmount(normalizedIngredient);
                      return (
                        <ListItem
                          key={`ingredient-${idx}`}
                          disablePadding
                          divider={idx < ingredientsToShow.length - 1}
                          sx={{ py: 1 }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography variant="body1" fontWeight="medium">{name}</Typography>
                            <Typography variant="body1" color="text.secondary">{amountLabel || '-'}</Typography>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center">
                    {t('recipes.noIngredients')}
                  </Typography>
                );
              })()}
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
                {t('recipes.saveAndShare')}
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
                    {isSaved ? t('recipes.saved') : t('recipes.saveAction')}
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
                  <Typography color="info" variant="body2">{t('common.share')}</Typography>
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

import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LanguageTest = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Language Test Page
        </Typography>
        <LanguageSwitcher variant="text" />
      </Box>

      <Grid container spacing={3}>
        {/* Common Translations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Common Translations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Sign In:</strong> {t('common.signIn')}</Typography>
                <Typography><strong>Sign Up:</strong> {t('common.signUp')}</Typography>
                <Typography><strong>Email:</strong> {t('common.email')}</Typography>
                <Typography><strong>Password:</strong> {t('common.password')}</Typography>
                <Typography><strong>Home:</strong> {t('common.home')}</Typography>
                <Typography><strong>Profile:</strong> {t('common.profile')}</Typography>
                <Typography><strong>Language:</strong> {t('common.language')}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Landing Page Translations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Landing Page Translations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Title:</strong> {t('landing.title')}</Typography>
                <Typography><strong>Subtitle:</strong> {t('landing.subtitle')}</Typography>
                <Typography><strong>Get Started:</strong> {t('landing.getStarted')}</Typography>
                <Typography><strong>Why Choose:</strong> {t('landing.whyChoose')}</Typography>
                <Typography><strong>Budget Friendly:</strong> {t('landing.budgetFriendly')}</Typography>
                <Typography><strong>Healthy Choices:</strong> {t('landing.healthyChoices')}</Typography>
                <Typography><strong>Easy Planning:</strong> {t('landing.easyPlanning')}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Auth Translations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Authentication Translations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>Sign In Title:</strong> {t('auth.signInTitle')}</Typography>
                <Typography><strong>Sign Up Title:</strong> {t('auth.signUpTitle')}</Typography>
                <Typography><strong>Don't Have Account:</strong> {t('auth.dontHaveAccount')}</Typography>
                <Typography><strong>Already Have Account:</strong> {t('auth.alreadyHaveAccount')}</Typography>
                <Typography><strong>Invalid Credentials:</strong> {t('auth.invalidCredentials')}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recipe Translations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recipe Translations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>My Recipes:</strong> {t('recipes.myRecipes')}</Typography>
                <Typography><strong>Saved Recipes:</strong> {t('recipes.savedRecipes')}</Typography>
                <Typography><strong>Create Recipe:</strong> {t('recipes.createRecipe')}</Typography>
                <Typography><strong>Recipe Name:</strong> {t('recipes.recipeName')}</Typography>
                <Typography><strong>Ingredients:</strong> {t('recipes.ingredients')}</Typography>
                <Typography><strong>Instructions:</strong> {t('recipes.instructions')}</Typography>
                <Typography><strong>Difficulty:</strong> {t('recipes.difficulty')}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Language Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              Current Language Information
            </Typography>
            <Typography variant="body1">
              <strong>Current Language:</strong> {t('common.language')} ({t('common.english')} / {t('common.turkish')})
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Use the language switcher above to change between English and Turkish. 
              All text on this page will update automatically.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LanguageTest;

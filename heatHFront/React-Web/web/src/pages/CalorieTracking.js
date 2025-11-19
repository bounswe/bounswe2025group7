import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Card, CardContent, CardMedia, 
  TextField, Button, Grid, CircularProgress, Alert, 
  FormControl, InputLabel, Select, MenuItem, Paper, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Template from '../components/Template';
import calorieService from '../services/calorieClient';
import apiClient from '../services/apiClient';

const CalorieTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for date selection
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: yyyy-MM-dd
  });
  
  // State for tracking data
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for adding new tracking
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [portion, setPortion] = useState('1');
  const [eatenDate, setEatenDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: yyyy-MM-dd
  });
  const [addingTracking, setAddingTracking] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  
  // Fetch recipes for selection
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoadingRecipes(true);
        const response = await apiClient.get('/recipe/get-all');
        setRecipes(response.data || []);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
        setError('Failed to load recipes. Please try again.');
      } finally {
        setLoadingRecipes(false);
      }
    };
    
    fetchRecipes();
  }, []);
  
  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calorieService.getUserTracking(selectedDate);
      setTrackingData(Array.isArray(data) ? data : []);
      setHasFetched(true);
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
      setError('Failed to load calorie tracking data. Please try again.');
      setTrackingData([]);
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleTracking = async () => {
    if (!selectedRecipeId || !portion || !eatenDate) {
      setError('Please select a recipe, enter a portion, and select a date.');
      return;
    }
    
    const portionNum = parseFloat(portion);
    if (isNaN(portionNum) || portionNum <= 0) {
      setError('Portion must be a positive number.');
      return;
    }
    
    try {
      setAddingTracking(true);
      setError(null);
      setSuccess(null);
      
      await calorieService.toggleCalorieTracking(eatenDate, selectedRecipeId, portionNum);
      
      setSuccess('Calorie tracking updated successfully!');
      
      // Reset form
      setSelectedRecipeId('');
      setPortion('1');
      
      // Refresh tracking data if the eatenDate matches the selectedDate
      if (eatenDate === selectedDate) {
        await fetchTrackingData();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to toggle tracking:', err);
      setError('Failed to update calorie tracking. Please try again.');
    } finally {
      setAddingTracking(false);
    }
  };
  
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    // Reset tracking data when date changes
    setTrackingData([]);
    setHasFetched(false);
  };
  
  const calculateTotalCalories = () => {
    return trackingData.reduce((total, item) => total + (item.calorie || 0), 0);
  };
  
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };
  
  return (
    <Template>
      <Box>
        <div style={{ textAlign: 'center' }}> 
          <Typography variant="h3" sx={{ color: 'primary.main', backgroundColor: 'white', mb: 3 }}>
            Calorie Tracking
          </Typography>
        </div>

        <Container maxWidth="md" sx={{ py: 4 }}>
                  
          {/* Add Tracking Form */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Add/Remove Calorie Tracking
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={1}>
                <TextField
                  type="date"
                  label="Eaten Date"
                  value={eatenDate}
                  onChange={(e) => setEatenDate(e.target.value)}
                  
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={addingTracking}
                />
              </Grid>
              <Grid item size={5} xs={12} sm={6} md={7}>
                <FormControl fullWidth>
                  <InputLabel>Select Recipe</InputLabel>
                  <Select
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    label="Select Recipe"
                    fullWidth
                    disabled={loadingRecipes || addingTracking}
                  >
                    {recipes.map((recipe) => (
                      <MenuItem key={recipe.id} value={recipe.id}>
                        {recipe.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Portion"
                  type="number"
                  value={portion}
                  onChange={(e) => setPortion(e.target.value)}
                  fullWidth
                  inputProps={{ 
                    step: '0.5', 
                    min: '0.5',
                    max: '10'
                  }}
                  helperText="e.g., 0.5, 1, 1.5, 2"
                  disabled={addingTracking}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleToggleTracking}
                  disabled={!selectedRecipeId || !portion || !eatenDate || addingTracking || loadingRecipes}
                  sx={{ height: '56px' }}
                >
                  {addingTracking ? <CircularProgress size={24} /> : 'Add Tracking'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* View Calorie Tracking */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              View Calorie Tracking
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item size={6} xs={12} sm={6} md={7}>
                <TextField
                  type="date"
                  label="Select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={loading}
                />
              </Grid>
              <Grid item size={6} xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={fetchTrackingData}
                  disabled={loading || !selectedDate}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  sx={{ height: '56px' }}
                >
                  {loading ? 'Loading...' : 'Get Tracking'}
                </Button>
              </Grid>
            </Grid>
            
            {trackingData.length > 0 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="h6" color="primary.contrastText">
                  Total Calories: {calculateTotalCalories().toFixed(0)}
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
          
          {/* Tracking Data Display */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : !hasFetched ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a date and click "Get Tracking" to view your calorie data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Or add a recipe above to start tracking your calories
              </Typography>
            </Paper>
          ) : trackingData.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No calorie tracking found for this date
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add a recipe above to start tracking your calories
              </Typography>
            </Paper>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Tracked Recipes ({trackingData.length})
              </Typography>
              <Grid container spacing={2}>
                {trackingData.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 6,
                        },
                      }}
                      onClick={() => handleRecipeClick(item.recipeId)}
                    >
                      {item.image && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={item.image}
                          alt={item.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom noWrap>
                          {item.name || 'Untitled Recipe'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                          <Chip 
                            label={`${item.calorie?.toFixed(0) || 0} cal`} 
                            color="primary" 
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </Template>
  );
};

export default CalorieTracking;


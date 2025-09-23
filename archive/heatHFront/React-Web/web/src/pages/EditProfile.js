import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Template from '../components/Template';
import interestFormService from '../services/interestFormService';

// --- helpers --------------------------------------------------------------
const LETTERS_ONLY = /^[A-Za-zğüşöçıİĞÜŞÖÇ\s]+$/u;
const todayStr = () => new Date().toISOString().split('T')[0];

const validateField = (name, value) => {
  switch (name) {
    case 'firstName':
    case 'lastName':
      if (!value) return 'Required';
      if (!LETTERS_ONLY.test(value)) return 'Only letters allowed';
      return '';
    case 'height':
      if (!value) return 'Required';
      if (+value < 50 || +value > 250) return 'Must be 50-250 cm';
      return '';
    case 'weight':
      if (!value) return 'Required';
      if (+value < 10 || +value > 300) return 'Must be 10-300 kg';
      return '';
    case 'dateOfBirth':
      if (!value) return 'Required';
      if (value > todayStr()) return 'Cannot be in the future';
      return '';
    case 'gender':
      return value ? '' : 'Required';
    default:
      return '';
  }
};
// -------------------------------------------------------------------------

const Input = styled('input')({ display: 'none' });

const EditProfile = () => {
  const navigate = useNavigate();
  const effectRan = useRef(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    weight: '',
    height: '',
    dateOfBirth: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [notif, setNotif] = useState({ open: false, msg: '', severity: 'error' });

  // ---------- load existing data once ------------------------------------
  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;
    const controller = new AbortController();

    (async () => {
      try {
        const data = await interestFormService.getInterestForm({ signal: controller.signal });
        const dob = data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '';
        setFormData({
          firstName: data.name || '',
          lastName: data.surname || '',
          dateOfBirth: dob,
          height: data.height != null ? data.height.toString() : '',
          weight: data.weight != null ? data.weight.toString() : '',
          gender: data.gender || '',
        });
        if (data.profilePhoto) setPreviewUrl(data.profilePhoto);
      } catch {
        /* empty -> new profile */
      }
    })();

    return () => controller.abort();
  }, []);

  // ---------- handlers ---------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // run a full validation pass
    const newErrors = Object.fromEntries(
      Object.keys(formData).map((k) => [k, validateField(k, formData[k])]),
    );
    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) {
      setNotif({
        open: true,
        severity: 'error',
        msg: 'Please fix the highlighted fields before saving.',
      });
      return;
    }

    try {
      await interestFormService.updateInterestForm({
        name: formData.firstName,
        surname: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        height: +formData.height,
        weight: +formData.weight,
        gender: formData.gender,
        profilePhoto: profilePhoto ? previewUrl : null,
      });
      setNotif({ open: true, severity: 'success', msg: 'Profile updated!' });
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      console.error(err);
      setNotif({ open: true, severity: 'error', msg: 'Save failed. Try again.' });
    }
  };

  // ---------- UI ---------------------------------------------------------
  return (
    <Template>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Edit Your Profile
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Please provide your information to get started
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3} justifyContent="center">
            {/* photo */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar src={previewUrl} sx={{ width: 120, height: 120, mb: 2 }} />
                <label htmlFor="profile-photo">
                  <Input id="profile-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
                  <IconButton
                    component="span"
                    color="primary"
                    sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white' }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            {/* first / last name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>

            {/* height / weight */}
            <Grid item xs={2} sm={2}>
              <TextField
                fullWidth
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                error={!!errors.height}
                helperText={errors.height}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                error={!!errors.weight}
                helperText={errors.weight}
              />
            </Grid>

            {/* gender */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                select
                value={formData.gender}
                onChange={handleChange}
                error={!!errors.gender}
                helperText={errors.gender}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>

            {/* dob */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: todayStr() }}
              />
            </Grid>

            {/* save */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                Save Profile
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* notification */}
      <Snackbar
        open={notif.open}
        autoHideDuration={3000}
        onClose={() => setNotif((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotif((n) => ({ ...n, open: false }))}
          severity={notif.severity}
          variant="filled"
        >
          {notif.msg}
        </Alert>
      </Snackbar>
    </Template>
  );
};

export default EditProfile;

import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import authService from '../../services/authService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

 /* Verification state (disabled)
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState(Array(6).fill(''));
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');
  */

  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

/* refs for code input fields (disabled)
  const inputRefs = useRef([]);
  */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'password') {
      setPasswordError(
        value.length < 6 ? t('auth.passwordRequired') : ''
      );
    } else if (name === 'username') {
      setEmailError(
        value.length < 1 ? t('auth.emailRequired') : ''
      );
    }
  };

  /* Countdown side-effect (disabled)
  useEffect(() => {
    let timer;
    if (codeSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [codeSent, countdown]);
  */

  /* Resend handler (disabled)
  const handleResend = () => {
    setError(null);
    setCode(Array(6).fill(''));
    setCountdown(15);
    setMessage('');
    authService.sendVerificationCode(form.username)
      .then(() => setMessage(t('auth.checkEmail')))
      .catch(() => setError(t('errors.genericError')));
  };
  */

  /* Initial send code handler (disabled)
  const handleSendCode = async () => {
    setError(null);
    setCodeSent(true);
    setCountdown(15);
    setMessage('');
    try {
      await authService.sendVerificationCode(form.username);
      setMessage(t('auth.checkEmail'));
    } catch {
      setError(t('errors.genericError'));
    }
  };
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Directly register and go to Sign In (same as old flow after verification)
      await authService.register(form);
      authService.logout();
      navigate('/signin', { state: { success: 'Registration successful!  Please sign in.' } });
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 409 || err.response?.status === 403)) {
        setError(
          <>An account already exists.{' '}
            <Link component={RouterLink} to="/signin" underline="hover">
              Sign in
            </Link>
          </>
        );
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };


/* Verification step (disabled)
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError(t('auth.emailRequired')); // Using a generic error message for code validation
      return;
    }
    const valid = await authService.verifyCode(form.username, parseInt(codeStr, 10));
    if (!valid) {
      setError('Invalid or expired code.');
      return;
    }
    */

   /* try {
      // Verify entered code first
      const valid = await authService.verifyCode(form.username, parseInt(codeStr, 10));
      if (!valid) {
        setError(t('auth.invalidCredentials'));
        return;
      }
      // If code valid, register user
      await authService.register(form);
      authService.logout();
      navigate('/signin', { state: { success: t('auth.passwordResetSuccess') } });
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 409 || err.response?.status === 403)) {
        setError(
          <>{t('auth.alreadyHaveAccount')}{' '}
            <Link component={RouterLink} to="/signin" underline="hover">
              {t('common.signIn')}
            </Link>
          </>
        );
      } else {
        setError(err.response?.data?.message || t('errors.genericError'));
      }
    }
  };*/

  // NEW: centralize disabled logic
  const isRegisterDisabled = !!passwordError || !form.password || !form.username;

  // Enter key directly submits only when Register is enabled
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isRegisterDisabled) {
        return; // block Enter when form is not valid
      }
      setError(null);

      /* Old flow (disabled)
      if (!codeSent) {
        handleSendCode();
      } else {
        handleSubmit(e);
      }
      */

      handleSubmit(e);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <LanguageSwitcher variant="icon" />
        </Box>
        <Typography variant="h5">{t('auth.signUpTitle')}</Typography>
        <Box component="form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} sx={{ mt: 2, width: '100%' }}>
          {/* Always show email/password */}
          <TextField
            label={t('common.email')}
            name="username"
            type="email"
            value={form.username}
            onChange={handleChange}
            required fullWidth margin="normal"
            error={!!emailError}
            helperText={emailError}
          />
          <TextField
            label={t('common.password')}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required fullWidth margin="normal"
            error={!!passwordError}
            helperText={passwordError}
          />

          {/* Verification UI (disabled)
          {codeSent && (
            <>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {t('auth.checkEmail')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {code.map((d, i) => (
                  <TextField
                    key={i}
                    inputRef={(el) => inputRefs.current[i] = el}
                    inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
                    value={d}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/, '');
                      const c = [...code]; c[i] = v; setCode(c);
                      if (v && i < code.length - 1) {
                        inputRefs.current[i + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        e.preventDefault();
                        const c = [...code];
                        if (c[i] !== '') {
                          c[i] = '';
                          setCode(c);
                        } else if (i > 0) {
                          c[i - 1] = '';
                          setCode(c);
                          inputRefs.current[i - 1]?.focus();
                        }
                      }
                    }}
                    sx={{ width: '3rem' }}
                  />
                ))}
              </Box>
              {!!message && <Typography color="primary" variant="body2" sx={{ mt: 1 }}>{message}</Typography>}
            </>
          )}
          */}

          {/* Show errors */}
          {!!error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}

          {/* Primary action: direct Register (verification disabled) */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={isRegisterDisabled}
          >
            Register
          </Button>

{/* Send/Resend buttons (disabled)
          {!codeSent && (
            <Button
              type="button"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleSendCode}
              disabled={!!passwordError || !form.password || !form.username}
            >
              {t('auth.sendResetLink')}
            </Button>
          )}
          {codeSent && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button type="submit" disabled={!!passwordError} variant="contained" sx={{ flex: 1, mr: 1 }}>
                {t('common.signUp')}
              </Button>
              <Button
                variant="text"
                onClick={handleResend}
                disabled={countdown > 0}
                sx={{ ml: 1, width: '17ch', whiteSpace: 'nowrap', textAlign: 'center' }}
              >
                {countdown > 0 ? `${t('auth.sendResetLink')} (${countdown}s)` : t('auth.sendResetLink')}
              </Button>
            </Box>
          )}
          */}

        </Box>

        <Box textAlign="center" mt={3}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ alignSelf: 'flex-start', mb: 5 }}>
            {t('common.back')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

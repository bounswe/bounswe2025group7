import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Typography, TextField, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState(Array(6).fill(''));
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // refs for OTP input fields
  const inputRefs = useRef([]);

  const handleChangeEmail = (e) => setEmail(e.target.value);

  useEffect(() => {
    let timer;
    if (codeSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [codeSent, countdown]);

  const handleSendCode = async () => {
    setError('');
    setMessage('');
    // First check if email is registered
    try {
      const exists = await authService.exists(email);
      if (!exists) {
        setError('Email not registered.');
        return;
      }
    } catch {
      setError('Unable to verify email.');
      return;
    }
    // Send code if email exists
    setCodeSent(true);
    setCountdown(15);
    try {
      await authService.sendVerificationCode(email);
      setMessage('Verification code sent to your email.');
    } catch {
      setError('Failed to send verification code.');
    }
  };

  const handleResend = () => {
    setError('');
    setMessage('');
    setCode(Array(6).fill(''));
    setCountdown(15);
    authService.sendVerificationCode(email)
      .then(() => setMessage('Verification code resent.'))
      .catch(() => setError('Failed to resend code.'));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    try {
      const valid = await authService.verifyCode(email, parseInt(codeStr, 10));
      if (valid) {
        navigate('/reset-password', { state: { email } });
      } else {
        setError('Invalid or expired code.');
      }
    } catch {
      setError('Verification failed.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Forgot Password
        </Typography>
        {!codeSent ? (
          <form>
            <TextField
              label="Email Address"
              variant="outlined"
              type="email"
              fullWidth
              value={email}
              onChange={handleChangeEmail}
              sx={{ mt: 2, mb: 2 }}
              required
            />
            {!!error && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="button"
              variant="contained"
              fullWidth
              onClick={handleSendCode}
            >
              Send Verification Code
            </Button>
          </form>
        ) : (
          <Box component="form" onSubmit={handleVerify}>
            <Typography variant="body1" gutterBottom>
              Enter the 6-digit code sent to <strong>{email}</strong>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 1 }}>
              {code.map((d, i) => (
                <TextField
                  key={i}
                  inputRef={(el) => (inputRefs.current[i] = el)}
                  inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
                  value={code[i]}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/, '');
                    const arr = [...code];
                    arr[i] = v;
                    setCode(arr);
                    if (v && i < code.length - 1) {
                      inputRefs.current[i + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      e.preventDefault();
                      const arr = [...code];
                      if (arr[i] !== '') {
                        arr[i] = '';
                        setCode(arr);
                      } else if (i > 0) {
                        arr[i - 1] = '';
                        setCode(arr);
                        inputRefs.current[i - 1]?.focus();
                      }
                    }
                  }}
                  sx={{ width: '3rem' }}
                  required
                />
              ))}
            </Box>
            {!!message && (
              <Typography color="primary" variant="body2" sx={{ mb: 1 }}>
                {message}
              </Typography>
            )}
            {!!error && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button type="submit" variant="contained" sx={{ flex: 1, mr: 1 }}>
                Verify Code
              </Button>
              <Button
                variant="text"
                onClick={handleResend}
                disabled={countdown > 0}
                sx={{ ml: 1 }}
              >
                {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
              </Button>
            </Box>
          </Box>
        )}
        <Button component={RouterLink} to="/signin" sx={{ mt: 3 }} fullWidth>
          Back to Sign In
        </Button>
      </Box>
    </Container>
  );
}
import { Login as LoginIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useLoginMutation } from './authApi';
import { setCredentials } from './authSlice';

import { useAppDispatch } from '@/app/hooks';

// Zod validation schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status?: unknown }).status === 'FETCH_ERROR'
  ) {
    return 'Login failed because the app could not reach the backend. Check that the backend is running and allows requests from this frontend.';
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data?: unknown }).data === 'object' &&
    (error as { data?: { message?: unknown } }).data?.message &&
    typeof (error as { data?: { message?: unknown } }).data?.message === 'string'
  ) {
    return (error as { data: { message: string } }).data.message;
  }

  return 'Login failed. Please check your credentials.';
};

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      if (result.error?.issues) {
        result.error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      const response = await login(formData).unwrap();

      dispatch(
        setCredentials({
          token: response.token,
          user: response.user,
          refreshToken: formData.rememberMe ? response.refreshToken : undefined,
        })
      );

      void navigate('/dashboard');
    } catch (error: unknown) {
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography component="h1" variant="h4" fontWeight="bold">
                AlgoTrading Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sign in to your account
              </Typography>
            </Box>

            <Box component="form" onSubmit={(event) => void handleSubmit(event)} noValidate>
              <Box
                sx={{
                  mb: 2,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: 'info.light',
                  color: 'info.contrastText',
                }}
              >
                <Typography variant="body2">
                  Local default account on first startup: <strong>admin</strong> / <strong>dogbert</strong>.
                </Typography>
              </Box>

              {apiError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {apiError}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                error={!!errors.username}
                helperText={errors.username || 'Use the username created by Liquibase seed or your custom user.'}
                disabled={isLoading}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                error={!!errors.password}
                helperText={errors.password || 'Password for selected user account.'}
                disabled={isLoading}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))
                    }
                    color="primary"
                    disabled={isLoading}
                  />
                }
                label="Remember me"
                title="Stores refresh token in browser so session can survive page reload."
                sx={{ mt: 1 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

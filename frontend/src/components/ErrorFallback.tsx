import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import type { ErrorInfo } from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

/**
 * ErrorFallback UI component displayed when ErrorBoundary catches an error.
 * Provides user-friendly error message and reload functionality.
 * 
 * Requirements: 18.8, 27.2
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
  const isDevelopment = import.meta.env.DEV;

  const handleReload = (): void => {
    // Try to reset the error boundary first
    onReset();
    
    // If that doesn't work, reload the page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: 'error.main',
              mb: 2,
            }}
          />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Oops! Something went wrong
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            We encountered an unexpected error. Please try reloading the page.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={handleReload}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>

          {isDevelopment && error && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                textAlign: 'left',
                overflow: 'auto',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Error Details (Development Only)
              </Typography>
              
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'error.main',
                }}
              >
                {error.toString()}
              </Typography>

              {error.stack && (
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    mt: 2,
                    color: 'text.secondary',
                  }}
                >
                  {error.stack}
                </Typography>
              )}

              {errorInfo?.componentStack && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Component Stack
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: 'text.secondary',
                    }}
                  >
                    {errorInfo.componentStack}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorFallback;

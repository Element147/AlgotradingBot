# ErrorBoundary Component

## Overview

The ErrorBoundary component is a React class component that catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI instead of crashing the entire application.

## Features

- ✅ Catches rendering errors in child components
- ✅ Displays user-friendly error fallback UI
- ✅ Provides reload functionality to recover from errors
- ✅ Logs errors to console in development
- ✅ Integrates with error tracking service (Sentry placeholder)
- ✅ Shows detailed error information in development mode
- ✅ Supports custom fallback UI
- ✅ Supports error callback for custom handling

## Requirements

- **Requirement 18.8**: Error Handling and Recovery
- **Requirement 27.2**: Error tracking integration

## Usage

### Basic Usage

```tsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback

```tsx
<ErrorBoundary fallback={<div>Custom error message</div>}>
  <YourComponent />
</ErrorBoundary>
```

### With Error Callback

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.log('Error occurred:', error);
    // Custom error handling logic
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Nested Error Boundaries

```tsx
function App() {
  return (
    {/* App-level error boundary */}
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Route-level error boundaries */}
          <Route
            path="/dashboard"
            element={
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
```

## Architecture

### ErrorBoundary Component

The main error boundary class component that:
- Implements `getDerivedStateFromError` to update state when an error occurs
- Implements `componentDidCatch` to log error details
- Manages error state (hasError, error, errorInfo)
- Provides reset functionality to retry rendering
- Integrates with error tracking service

### ErrorFallback Component

The fallback UI component that:
- Displays user-friendly error message
- Provides reload button to recover
- Shows detailed error information in development mode
- Uses Material-UI for consistent styling

## Error Tracking Integration

The ErrorBoundary includes a placeholder for Sentry integration:

```typescript
private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
  // Placeholder for Sentry or other error tracking service
  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.log('Error logged to tracking service:', errorData);
  
  // Future implementation:
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, {
  //     contexts: {
  //       react: {
  //         componentStack: errorInfo.componentStack,
  //       },
  //     },
  //   });
  // }
}
```

### To Enable Sentry

1. Install Sentry SDK:
```bash
npm install @sentry/react
```

2. Initialize Sentry in main.tsx:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

3. Uncomment Sentry code in ErrorBoundary.tsx

## Best Practices

### 1. Multiple Error Boundaries

Use multiple error boundaries to isolate errors:
- App-level boundary: Catches all errors
- Route-level boundaries: Isolate errors to specific pages
- Component-level boundaries: Isolate errors in complex components

### 2. Error Recovery

The ErrorFallback provides a reload button that:
1. First tries to reset the error boundary state
2. If that fails, reloads the entire page

### 3. Development vs Production

- **Development**: Shows detailed error information including stack traces
- **Production**: Shows user-friendly message only, logs to error tracking service

### 4. Error Logging

All errors are:
- Logged to console in development
- Sent to error tracking service in production
- Include component stack trace for debugging

## Testing

The ErrorBoundary includes comprehensive unit tests:

```bash
npm test ErrorBoundary.test.tsx
```

Tests cover:
- ✅ Renders children when no error
- ✅ Renders fallback when error occurs
- ✅ Calls onError callback
- ✅ Supports custom fallback
- ✅ Resets error state
- ✅ Logs errors to console
- ✅ Shows error details in development
- ✅ Handles multiple errors

## Limitations

Error boundaries do NOT catch errors in:
- Event handlers (use try-catch instead)
- Asynchronous code (setTimeout, promises)
- Server-side rendering
- Errors thrown in the error boundary itself

For these cases, use traditional error handling:

```typescript
// Event handler
const handleClick = () => {
  try {
    // Code that might throw
  } catch (error) {
    console.error('Error in event handler:', error);
  }
};

// Async code
const fetchData = async () => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
```

## Files

- `ErrorBoundary.tsx` - Main error boundary component
- `ErrorFallback.tsx` - Fallback UI component
- `ErrorBoundary.test.tsx` - Unit tests
- `ErrorBoundary.md` - This documentation

## Related Requirements

- **18.8**: Error Handling and Recovery
  - Implements Error_Boundary components that catch React rendering errors
  - Displays fallback UI with error message and reload button
  
- **27.2**: Error tracking integration
  - Logs errors to error tracking service (Sentry placeholder)
  - Includes error context (stack trace, component stack, user agent, URL)

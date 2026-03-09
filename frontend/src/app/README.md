# Redux Store Configuration

This directory contains the Redux store configuration with RTK Query integration.

## Files

### `store.ts`
Main Redux store configuration using `configureStore` from Redux Toolkit.

**Features:**
- Centralized state management
- RTK Query middleware integration
- Redux DevTools (development only)
- Automatic refetch on focus/reconnect

**Usage:**
```typescript
import { store } from './app/store';
import type { RootState, AppDispatch } from './app/store';
```

### `hooks.ts`
Typed Redux hooks for use throughout the application.

**Exports:**
- `useAppDispatch` - Typed version of `useDispatch`
- `useAppSelector` - Typed version of `useSelector`

**Usage:**
```typescript
import { useAppDispatch, useAppSelector } from './app/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const value = useAppSelector((state) => state.someSlice.value);
  
  // ...
}
```

## Store Structure

The Redux store will contain:

1. **UI State Slices** (regular Redux slices):
   - `auth` - Authentication state (token, user, session)
   - `environment` - Environment mode (test/live)
   - `settings` - User preferences (theme, timezone, currency)
   - `websocket` - WebSocket connection state
   - `notifications` - Notification queue

2. **API Slices** (RTK Query):
   - `accountApi` - Account balance and performance
   - `strategiesApi` - Strategy management
   - `tradesApi` - Trade history and details
   - `backtestApi` - Backtest results and execution
   - `riskApi` - Risk metrics and configuration
   - `exchangeApi` - Exchange integration

## Adding New Slices

### Regular Redux Slice
```typescript
// features/myFeature/mySlice.ts
import { createSlice } from '@reduxjs/toolkit';

const mySlice = createSlice({
  name: 'myFeature',
  initialState: { /* ... */ },
  reducers: { /* ... */ },
});

export const { actions } = mySlice;
export default mySlice.reducer;

// Add to store.ts
import myReducer from '../features/myFeature/mySlice';

export const store = configureStore({
  reducer: {
    myFeature: myReducer,
    // ...
  },
});
```

### RTK Query API Slice
```typescript
// features/myFeature/myApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithEnvironment } from '../../services/api';

export const myApi = createApi({
  reducerPath: 'myApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['MyData'],
  endpoints: (builder) => ({
    getData: builder.query({
      query: () => '/api/my-data',
      providesTags: ['MyData'],
    }),
  }),
});

export const { useGetDataQuery } = myApi;

// Add to store.ts
import { myApi } from '../features/myFeature/myApi';

export const store = configureStore({
  reducer: {
    [myApi.reducerPath]: myApi.reducer,
    // ...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(myApi.middleware),
});
```

## Environment Variables

Required environment variables (defined in `.env`):
- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8080)
- `VITE_WS_URL` - WebSocket URL (default: ws://localhost:8080/ws)

## Redux DevTools

Redux DevTools are enabled in development mode only. Install the browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

## Next Steps

1. Task 1.4: Implement authentication slice and API
2. Task 2.3: Implement environment slice
3. Task 2.4: Create account API slice
4. Additional API slices as needed

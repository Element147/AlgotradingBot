import { configureStore } from '@reduxjs/toolkit';
import type { Middleware, Reducer } from '@reduxjs/toolkit';

/**
 * Utility function to set up a test store for RTK Query API testing
 *
 * @param api - The RTK Query API to test
 * @returns An object containing the store and API instance
 */
type ApiLike = {
  reducerPath: string;
  reducer: Reducer;
  middleware: Middleware;
  util: { resetApiState: () => unknown };
};

export function setupApiStore<A extends ApiLike>(api: A) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

  return { store, api };
}

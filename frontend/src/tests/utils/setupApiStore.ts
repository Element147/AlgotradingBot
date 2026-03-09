import { configureStore } from '@reduxjs/toolkit';
import type { Api } from '@reduxjs/toolkit/query';

/**
 * Utility function to set up a test store for RTK Query API testing
 * 
 * @param api - The RTK Query API to test
 * @returns An object containing the store and API instance
 */
export function setupApiStore<
  A extends {
    reducerPath: string;
    reducer: any;
    middleware: any;
    util: { resetApiState: () => any };
  }
>(api: A) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

  return { store, api };
}

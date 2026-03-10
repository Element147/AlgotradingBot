import { createApi } from '@reduxjs/toolkit/query/react';

import { type User } from './authSlice';

import { baseQueryWithEnvironment } from '@/services/api';

interface RawAuthUser {
  id: string | number;
  username: string;
  email?: string;
  role: string;
}

interface RawLoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user: RawAuthUser;
  expiresIn: number;
}

interface RawRefreshTokenResponse {
  token?: string;
  accessToken?: string;
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

const normalizeRole = (role: string): User['role'] =>
  role.toLowerCase() === 'admin' ? 'admin' : 'trader';

const normalizeUser = (user: RawAuthUser): User => ({
  id: String(user.id),
  username: user.username,
  email: user.email ?? '',
  role: normalizeRole(user.role),
});

const resolveToken = (token?: string, accessToken?: string): string => {
  const resolved = token ?? accessToken;

  if (!resolved) {
    throw new Error('Authentication response did not include a usable access token');
  }

  return resolved;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithEnvironment,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: RawLoginResponse): LoginResponse => ({
        token: resolveToken(response.token, response.accessToken),
        refreshToken: response.refreshToken,
        user: normalizeUser(response.user),
        expiresIn: response.expiresIn,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: '/api/auth/refresh',
        method: 'POST',
      }),
      transformResponse: (response: RawRefreshTokenResponse): RefreshTokenResponse => ({
        token: resolveToken(response.token, response.accessToken),
        expiresIn: response.expiresIn,
      }),
    }),

    getMe: builder.query<User, void>({
      query: () => '/api/auth/me',
      transformResponse: (response: RawAuthUser): User => normalizeUser(response),
      providesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshTokenMutation, useGetMeQuery } =
  authApi;

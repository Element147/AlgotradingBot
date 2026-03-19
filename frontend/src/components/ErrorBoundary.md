# ErrorBoundary

## Purpose

`ErrorBoundary.tsx` is the shared React error boundary used by the app shell and route surfaces.

## Current Behavior

- catches render-time errors in child components
- records the error and component stack
- renders the shared `ErrorFallback` when no custom fallback is supplied
- supports an optional `fallback` prop
- supports an optional `onError` callback
- logs to the console and a placeholder tracking hook
- allows the user to reset and retry rendering

## Current Usage

The app mounts:

- one top-level error boundary around the router
- additional route-level boundaries around protected pages

This keeps a single page failure from taking down the whole app unnecessarily.

## Notes

- The tracking integration is still a placeholder hook, not a full external error service.
- If error handling behavior changes materially, update `docs/guides/FRONTEND_IMPLEMENTATION.md`.

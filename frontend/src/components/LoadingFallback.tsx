import { Box, Skeleton, Stack } from '@mui/material';

/**
 * LoadingFallback component displays skeleton screens while lazy-loaded routes are loading
 * 
 * Provides a consistent loading experience across all routes with:
 * - Header skeleton
 * - Content area skeletons
 * - Responsive layout
 */
export default function LoadingFallback() {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header skeleton */}
      <Box sx={{ height: 64, borderBottom: 1, borderColor: 'divider', px: 2, display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Skeleton variant="text" width={150} height={32} />
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>

      {/* Main content skeleton */}
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar skeleton */}
        <Box
          sx={{
            width: 240,
            borderRight: 1,
            borderColor: 'divider',
            p: 2,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
          </Stack>
        </Box>

        {/* Content area skeleton */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

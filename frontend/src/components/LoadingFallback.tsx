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
      <Box
        sx={{
          height: 84,
          borderBottom: 1,
          borderColor: 'divider',
          px: { xs: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backdropFilter: 'blur(12px)',
        }}
      >
        <Skeleton variant="circular" width={42} height={42} />
        <Box sx={{ flexGrow: 1, maxWidth: 560 }}>
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width="72%" height={34} />
          <Skeleton variant="text" width="100%" height={20} />
        </Box>
        <Skeleton variant="rounded" width={120} height={32} />
        <Skeleton variant="circular" width={42} height={42} />
        <Skeleton variant="circular" width={42} height={42} />
      </Box>

      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 84px)' }}>
        <Box
          sx={{
            width: 272,
            borderRight: 1,
            borderColor: 'divider',
            p: 2,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Stack spacing={2.5}>
            <Skeleton variant="rectangular" height={144} />
            <Box>
              <Skeleton variant="text" width={84} height={18} sx={{ mb: 1 }} />
              <Stack spacing={1}>
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
              </Stack>
            </Box>
            <Box>
              <Skeleton variant="text" width={84} height={18} sx={{ mb: 1 }} />
              <Stack spacing={1}>
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
              </Stack>
            </Box>
            <Skeleton variant="rectangular" height={92} />
          </Stack>
        </Box>

        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Skeleton variant="rectangular" height={220} />
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
              <Skeleton variant="rectangular" height={160} sx={{ flex: 1 }} />
              <Skeleton variant="rectangular" height={160} sx={{ flex: 1 }} />
              <Skeleton variant="rectangular" height={160} sx={{ flex: 1 }} />
            </Stack>
            <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2}>
              <Skeleton variant="rectangular" height={280} sx={{ flex: 1.1 }} />
              <Skeleton variant="rectangular" height={280} sx={{ flex: 0.9 }} />
            </Stack>
            <Skeleton variant="rectangular" height={320} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

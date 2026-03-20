import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
}

export function PageContent({ children }: PageContentProps) {
  return (
    <Stack spacing={{ xs: 2.5, lg: 3 }}>
      {children}
    </Stack>
  );
}

interface PageIntroProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description: ReactNode;
  chips?: ReactNode;
  actions?: ReactNode;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  chips,
  actions,
}: PageIntroProps) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
        >
          <Box sx={{ maxWidth: 920 }}>
            {eyebrow ? (
              <Typography variant="overline" color="text.secondary">
                {eyebrow}
              </Typography>
            ) : null}
            {title ? (
              <Typography variant="h5" sx={{ mb: 1 }}>
                {title}
              </Typography>
            ) : null}
            <Typography variant="body1" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {description}
            </Typography>
          </Box>
          {actions ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', lg: 'center' }}
              sx={{ flexShrink: 0, width: { xs: '100%', lg: 'auto' } }}
            >
              {actions}
            </Stack>
          ) : null}
        </Stack>

        {chips ? (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ '& > *': { maxWidth: '100%' } }}
          >
            {chips}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}

export interface PageMetricItem {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: AlertColor | 'default';
}

interface PageMetricStripProps {
  items: PageMetricItem[];
}

export function PageMetricStrip({ items }: PageMetricStripProps) {
  const theme = useTheme();

  const toneColor = (tone: PageMetricItem['tone']) => {
    switch (tone) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const toneLabel = (tone: PageMetricItem['tone']) => {
    switch (tone) {
      case 'success':
        return 'OK';
      case 'warning':
        return 'Watch';
      case 'error':
        return 'Critical';
      case 'info':
        return 'Info';
      default:
        return 'Review';
    }
  };

  return (
    <Grid container spacing={1.5}>
      {items.map((item) => {
        const accent = toneColor(item.tone);

        return (
          <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                height: '100%',
                p: 2,
                borderLeft: `3px solid ${accent}`,
                backgroundColor: 'background.paper',
              }}
            >
              <Stack spacing={0.75}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: accent,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {toneLabel(item.tone)}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                  {item.value}
                </Typography>
                {item.detail ? (
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                    {item.detail}
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

interface PageSectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageSectionHeader({
  title,
  description,
  actions,
}: PageSectionHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
    >
      <Box sx={{ maxWidth: 840 }}>
        <Typography variant="h6">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', md: 'center' }}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          {actions}
        </Stack>
      ) : null}
    </Stack>
  );
}

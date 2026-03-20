import { Box, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
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
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2.5}>
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
              <Typography variant="body1" color="text.secondary">
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
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {chips}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
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
                borderRadius: 3,
                backgroundColor: alpha(accent, 0.04),
              }}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {item.label}
                  </Typography>
                  <Chip
                    size="small"
                    label={toneLabel(item.tone)}
                    variant="outlined"
                    sx={{
                      textTransform: 'capitalize',
                      borderColor: alpha(accent, 0.18),
                      color: accent,
                    }}
                  />
                </Stack>
                <Typography variant="h6">{item.value}</Typography>
                {item.detail ? (
                  <Typography variant="body2" color="text.secondary">
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

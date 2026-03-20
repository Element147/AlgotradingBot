import { Stack, Typography, useMediaQuery, useTheme, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { SurfacePanel } from '../ui/Workbench';

interface StickyInspectorPanelProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  top?: number;
  sx?: SxProps<Theme>;
}

export function StickyInspectorPanel({
  title,
  description,
  actions,
  children,
  top = 112,
  sx,
}: StickyInspectorPanelProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('xl'));

  return (
    <SurfacePanel
      elevated
      title={title}
      description={description}
      actions={actions}
      sx={{
        position: isDesktop ? 'sticky' : 'relative',
        top: isDesktop ? top : undefined,
        ...sx,
      }}
      contentSx={{ gap: 1.75 }}
    >
      <Stack spacing={1.75}>{children}</Stack>
      {!isDesktop ? (
        <Typography variant="caption" color="text.secondary">
          Inspector stays inline on smaller screens so chart review and detail reading remain in one scroll path.
        </Typography>
      ) : null}
    </SurfacePanel>
  );
}

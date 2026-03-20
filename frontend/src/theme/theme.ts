import {
  alpha,
  createTheme,
  type PaletteMode,
  type Theme,
} from '@mui/material/styles';

const buildTheme = (mode: PaletteMode): Theme => {
  const isLight = mode === 'light';
  const primaryMain = isLight ? '#126b67' : '#7ce7da';
  const secondaryMain = isLight ? '#c06d18' : '#ffc163';
  const defaultBackground = isLight ? '#efe8dc' : '#091015';
  const paperBackground = isLight ? '#fffaf3' : '#101a1f';
  const shellBackground = isLight ? '#f8f2e8' : '#0f181d';
  const textPrimary = isLight ? '#162127' : '#eef6f2';
  const textSecondary = isLight ? '#566671' : '#97a9b3';
  const divider = alpha(isLight ? '#17354a' : '#d8efe8', isLight ? 0.12 : 0.16);
  const cardShadow = isLight
    ? '0 28px 56px rgba(13, 24, 31, 0.09)'
    : '0 28px 70px rgba(1, 8, 10, 0.48)';
  const sectionShadow = isLight
    ? '0 18px 44px rgba(19, 35, 42, 0.08)'
    : '0 18px 48px rgba(3, 8, 10, 0.34)';
  const focusedRing = `0 0 0 3px ${alpha(primaryMain, isLight ? 0.22 : 0.3)}`;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: isLight ? '#14b8a6' : '#9af1e6',
        dark: isLight ? '#115e59' : '#2dd4bf',
        contrastText: isLight ? '#f6fffd' : '#062221',
      },
      secondary: {
        main: secondaryMain,
        light: isLight ? '#f59e0b' : '#ffd699',
        dark: isLight ? '#92400e' : '#dd8f24',
        contrastText: isLight ? '#fff8ef' : '#2f1703',
      },
      success: {
        main: isLight ? '#157f57' : '#6ce6a8',
        light: isLight ? '#22c55e' : '#9cf0c5',
        dark: isLight ? '#0f5b3e' : '#32c47e',
        contrastText: isLight ? '#f7fff9' : '#073420',
      },
      error: {
        main: isLight ? '#b42318' : '#ff8f83',
        light: isLight ? '#ef4444' : '#ffb4ab',
        dark: isLight ? '#7a1f16' : '#e46d61',
        contrastText: isLight ? '#fff8f7' : '#380907',
      },
      warning: {
        main: isLight ? '#c7790a' : '#ffd166',
        light: isLight ? '#f59e0b' : '#ffe08f',
        dark: isLight ? '#8b5307' : '#d6aa3f',
        contrastText: isLight ? '#fff9ef' : '#362002',
      },
      info: {
        main: isLight ? '#2563eb' : '#76b6ff',
        light: isLight ? '#60a5fa' : '#9ed0ff',
        dark: isLight ? '#1d4ed8' : '#4e92e2',
        contrastText: isLight ? '#f8fbff' : '#07192f',
      },
      background: {
        default: defaultBackground,
        paper: paperBackground,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: alpha(textPrimary, 0.42),
      },
      divider,
    },
    shape: {
      borderRadius: 24,
    },
    typography: {
      fontFamily: '"Aptos", "Segoe UI Variable Text", "Segoe UI", "Trebuchet MS", sans-serif',
      h1: {
        fontFamily: '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '3rem',
        fontWeight: 700,
        letterSpacing: '-0.04em',
      },
      h2: {
        fontFamily: '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '2.4rem',
        fontWeight: 700,
        letterSpacing: '-0.04em',
      },
      h3: {
        fontFamily: '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h4: {
        fontFamily: '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '1.7rem',
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h5: {
        fontFamily: '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '1.32rem',
        fontWeight: 700,
      },
      h6: {
        fontFamily: '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '1rem',
        fontWeight: 700,
      },
      subtitle2: {
        fontWeight: 700,
        letterSpacing: '0.03em',
      },
      body1: {
        lineHeight: 1.65,
      },
      body2: {
        lineHeight: 1.6,
      },
      overline: {
        fontWeight: 700,
        letterSpacing: '0.18em',
      },
      button: {
        fontWeight: 700,
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor: shellBackground,
          },
          body: {
            backgroundColor: defaultBackground,
            backgroundImage: isLight
              ? 'radial-gradient(circle at top left, rgba(18, 107, 103, 0.14), transparent 34%), radial-gradient(circle at 85% 16%, rgba(192, 109, 24, 0.12), transparent 22%), linear-gradient(180deg, #faf5eb 0%, #efe8dc 100%)'
              : 'radial-gradient(circle at top left, rgba(124, 231, 218, 0.18), transparent 30%), radial-gradient(circle at 82% 15%, rgba(255, 193, 99, 0.14), transparent 20%), linear-gradient(180deg, #0e171d 0%, #081015 100%)',
            backgroundAttachment: 'fixed',
            color: textPrimary,
          },
          'body::before': {
            content: '""',
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: isLight
              ? 'linear-gradient(rgba(19, 35, 42, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(19, 35, 42, 0.025) 1px, transparent 1px)'
              : 'linear-gradient(rgba(216, 239, 232, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(216, 239, 232, 0.03) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent)',
            zIndex: 0,
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(primaryMain, 0.42)} transparent`,
          },
          '::selection': {
            backgroundColor: alpha(primaryMain, 0.28),
          },
          '*::-webkit-scrollbar': {
            width: 11,
            height: 11,
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(primaryMain, 0.28),
            borderRadius: 999,
            border: `3px solid ${alpha(shellBackground, 0.1)}`,
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          ':focus-visible': {
            outline: 'none',
            boxShadow: focusedRing,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isLight
              ? alpha('#fff7ee', 0.9)
              : alpha('#0e181d', 0.92),
            backdropFilter: 'blur(24px)',
            borderBottom: `1px solid ${divider}`,
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isLight
              ? 'linear-gradient(180deg, rgba(255, 250, 241, 0.97) 0%, rgba(244, 236, 222, 0.99) 100%)'
              : 'linear-gradient(180deg, rgba(16, 26, 31, 0.98) 0%, rgba(10, 18, 22, 0.99) 100%)',
            borderRight: `1px solid ${divider}`,
            boxShadow: sectionShadow,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            position: 'relative',
            overflow: 'hidden',
            background: isLight
              ? alpha('#fffaf4', 0.92)
              : alpha('#142127', 0.94),
            border: `1px solid ${divider}`,
            boxShadow: cardShadow,
            backdropFilter: 'blur(18px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: isLight
                ? 'linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 46%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 42%)',
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            position: 'relative',
            zIndex: 1,
            padding: 24,
            '&:last-child': {
              paddingBottom: 24,
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 999,
            paddingInline: 16,
            minHeight: 40,
          },
          containedPrimary: {
            boxShadow: `0 12px 28px ${alpha(primaryMain, isLight ? 0.24 : 0.28)}`,
          },
          outlined: {
            borderColor: alpha(textPrimary, 0.14),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${alpha(textPrimary, isLight ? 0.08 : 0.12)}`,
            backgroundColor: alpha(paperBackground, isLight ? 0.38 : 0.26),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
            borderColor: alpha(textPrimary, 0.08),
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: `1px solid ${divider}`,
            backgroundColor: alpha(paperBackground, isLight ? 0.72 : 0.44),
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            marginTop: 10,
            borderRadius: 20,
            border: `1px solid ${divider}`,
            background: isLight
              ? alpha('#fffaf3', 0.96)
              : alpha('#111b20', 0.97),
            backdropFilter: 'blur(18px)',
            boxShadow: sectionShadow,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            marginInline: 8,
            marginBlock: 2,
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 86,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: divider,
          },
          head: {
            fontSize: '0.73rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: textSecondary,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${divider}`,
            backgroundColor: alpha(paperBackground, isLight ? 0.72 : 0.42),
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 120ms ease',
            '&:hover': {
              backgroundColor: alpha(primaryMain, isLight ? 0.05 : 0.08),
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 18,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: alpha(paperBackground, isLight ? 0.76 : 0.32),
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(textPrimary, isLight ? 0.1 : 0.14),
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(primaryMain, 0.3),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
              borderColor: primaryMain,
            },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            padding: 4,
            borderRadius: 999,
            backgroundColor: alpha(textPrimary, isLight ? 0.04 : 0.08),
            border: `1px solid ${divider}`,
          },
          grouped: {
            margin: 0,
            border: 0,
            borderRadius: 999,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            color: textSecondary,
            '&.Mui-selected': {
              backgroundColor: alpha(primaryMain, isLight ? 0.13 : 0.16),
              color: textPrimary,
            },
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: alpha(textPrimary, isLight ? 0.08 : 0.12),
            transform: 'none',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 14,
            backgroundColor: isLight ? '#173038' : '#f3f7f5',
            color: isLight ? '#f5f8f7' : '#102228',
            boxShadow: sectionShadow,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: divider,
          },
        },
      },
    },
  });
};

export const lightTheme: Theme = buildTheme('light');

export const darkTheme: Theme = buildTheme('dark');

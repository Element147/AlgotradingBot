import {
  alpha,
  createTheme,
  type PaletteMode,
  type Theme,
} from '@mui/material/styles';

const buildTheme = (mode: PaletteMode): Theme => {
  const isLight = mode === 'light';
  const primaryMain = isLight ? '#176a65' : '#84e1d4';
  const secondaryMain = isLight ? '#b36a1f' : '#ffc870';
  const defaultBackground = isLight ? '#f4efe7' : '#0b1115';
  const paperBackground = isLight ? '#fffdfa' : '#121b20';
  const shellBackground = isLight ? '#ece5da' : '#081015';
  const textPrimary = isLight ? '#162128' : '#eef5f1';
  const textSecondary = isLight ? '#5d6c75' : '#9aa9b1';
  const divider = alpha(isLight ? '#17354a' : '#d7ece5', isLight ? 0.12 : 0.14);
  const cardShadow = isLight
    ? '0 14px 28px rgba(15, 24, 31, 0.06)'
    : '0 14px 30px rgba(0, 7, 10, 0.28)';
  const sectionShadow = isLight
    ? '0 10px 20px rgba(15, 24, 31, 0.05)'
    : '0 10px 24px rgba(0, 7, 10, 0.22)';
  const focusedRing = `0 0 0 3px ${alpha(primaryMain, isLight ? 0.2 : 0.28)}`;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: isLight ? '#2fa49c' : '#a8f0e7',
        dark: isLight ? '#0f5652' : '#4dc6b6',
        contrastText: isLight ? '#f6fffd' : '#06221f',
      },
      secondary: {
        main: secondaryMain,
        light: isLight ? '#d18c41' : '#ffd89a',
        dark: isLight ? '#8b4c0f' : '#d69a43',
        contrastText: isLight ? '#fff9f2' : '#301902',
      },
      success: {
        main: isLight ? '#1d7a55' : '#7ae0ad',
        light: isLight ? '#2ba76f' : '#a6edc9',
        dark: isLight ? '#13553a' : '#45c187',
        contrastText: isLight ? '#f7fff9' : '#082f1f',
      },
      error: {
        main: isLight ? '#b42318' : '#ff9a8e',
        light: isLight ? '#d94841' : '#ffc0b8',
        dark: isLight ? '#7c1d16' : '#e17367',
        contrastText: isLight ? '#fff8f7' : '#350907',
      },
      warning: {
        main: isLight ? '#b7791f' : '#ffcf78',
        light: isLight ? '#d89a3e' : '#ffe0a3',
        dark: isLight ? '#845111' : '#ddb05c',
        contrastText: isLight ? '#fffaf3' : '#362104',
      },
      info: {
        main: isLight ? '#2b6ed7' : '#8abfff',
        light: isLight ? '#5a97ea' : '#b0d7ff',
        dark: isLight ? '#1f4e9a' : '#5b9de5',
        contrastText: isLight ? '#f8fbff' : '#09192f',
      },
      background: {
        default: defaultBackground,
        paper: paperBackground,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: alpha(textPrimary, 0.44),
      },
      divider,
    },
    shape: {
      borderRadius: 18,
    },
    typography: {
      fontFamily:
        '"Aptos", "Segoe UI Variable Text", "Segoe UI", "Trebuchet MS", sans-serif',
      h1: {
        fontFamily:
          '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '2.85rem',
        fontWeight: 700,
        letterSpacing: '-0.04em',
      },
      h2: {
        fontFamily:
          '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '2.35rem',
        fontWeight: 700,
        letterSpacing: '-0.04em',
      },
      h3: {
        fontFamily:
          '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '1.95rem',
        fontWeight: 700,
        letterSpacing: '-0.03em',
      },
      h4: {
        fontFamily:
          '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '1.55rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h5: {
        fontFamily:
          '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '1.3rem',
        fontWeight: 700,
      },
      h6: {
        fontFamily:
          '"Bahnschrift", "Segoe UI Variable Display", "Trebuchet MS", sans-serif',
        fontSize: '1.05rem',
        fontWeight: 700,
      },
      subtitle2: {
        fontWeight: 700,
        letterSpacing: '0.03em',
      },
      body1: {
        lineHeight: 1.62,
      },
      body2: {
        lineHeight: 1.58,
      },
      overline: {
        fontWeight: 700,
        letterSpacing: '0.14em',
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
              ? 'linear-gradient(180deg, #f7f2ea 0%, #f1ebe2 100%)'
              : 'linear-gradient(180deg, #0f171c 0%, #091015 100%)',
            color: textPrimary,
          },
          '#root': {
            minHeight: '100vh',
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(primaryMain, 0.42)} transparent`,
          },
          '::selection': {
            backgroundColor: alpha(primaryMain, 0.24),
          },
          '*::-webkit-scrollbar': {
            width: 11,
            height: 11,
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(primaryMain, 0.28),
            borderRadius: 999,
            border: `3px solid ${alpha(shellBackground, 0.08)}`,
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
            backgroundColor: alpha(paperBackground, isLight ? 0.94 : 0.9),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${divider}`,
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? '#f8f3ec' : '#0f181d',
            borderRight: `1px solid ${divider}`,
            boxShadow: sectionShadow,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            borderColor: divider,
            backgroundColor: alpha(paperBackground, isLight ? 0.88 : 0.76),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(paperBackground, isLight ? 0.94 : 0.92),
            border: `1px solid ${divider}`,
            boxShadow: cardShadow,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 22,
            '&:last-child': {
              paddingBottom: 22,
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
            borderRadius: 14,
            paddingInline: 16,
            minHeight: 40,
          },
          containedPrimary: {
            boxShadow: `0 10px 18px ${alpha(primaryMain, isLight ? 0.16 : 0.22)}`,
          },
          outlined: {
            borderColor: alpha(textPrimary, 0.14),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: `1px solid ${alpha(textPrimary, isLight ? 0.08 : 0.12)}`,
            backgroundColor: alpha(paperBackground, isLight ? 0.76 : 0.32),
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
            borderRadius: 16,
            border: `1px solid ${divider}`,
            backgroundColor: alpha(paperBackground, isLight ? 0.9 : 0.72),
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            marginTop: 10,
            borderRadius: 16,
            border: `1px solid ${divider}`,
            backgroundColor: alpha(paperBackground, isLight ? 0.98 : 0.94),
            boxShadow: sectionShadow,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            marginInline: 8,
            marginBlock: 2,
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 76,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: divider,
            verticalAlign: 'top',
          },
          head: {
            fontSize: '0.72rem',
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
            borderRadius: 14,
            border: `1px solid ${divider}`,
            backgroundColor: alpha(paperBackground, isLight ? 0.9 : 0.62),
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
            borderRadius: 14,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: alpha(paperBackground, isLight ? 0.78 : 0.3),
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(textPrimary, isLight ? 0.1 : 0.16),
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(primaryMain, 0.28),
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
            borderRadius: 14,
            backgroundColor: alpha(textPrimary, isLight ? 0.04 : 0.08),
            border: `1px solid ${divider}`,
          },
          grouped: {
            margin: 0,
            border: 0,
            borderRadius: 12,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            color: textSecondary,
            '&.Mui-selected': {
              backgroundColor: alpha(primaryMain, isLight ? 0.13 : 0.16),
              color: textPrimary,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 999,
            backgroundColor: primaryMain,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            alignItems: 'flex-start',
            minHeight: 48,
            fontWeight: 700,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            border: `1px solid ${divider}`,
            backgroundColor: alpha(paperBackground, isLight ? 0.98 : 0.96),
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 8,
            borderRadius: 999,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: alpha(textPrimary, isLight ? 0.08 : 0.12),
            transform: 'none',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 12,
            backgroundColor: isLight ? '#183037' : '#f3f7f5',
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

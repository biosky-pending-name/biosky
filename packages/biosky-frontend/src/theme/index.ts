import { createTheme, Theme, PaletteMode } from "@mui/material/styles";

const sharedConfig = {
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    h1: { fontSize: "1.5rem", fontWeight: 600 },
    h2: { fontSize: "1.25rem", fontWeight: 600 },
    h3: { fontSize: "1.1rem", fontWeight: 600 },
    body1: { fontSize: "1rem" },
    body2: { fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem" },
  },
  shape: {
    borderRadius: 8,
  },
};

const darkPalette = {
  mode: "dark" as PaletteMode,
  primary: {
    main: "#22c55e",
    dark: "#16a34a",
    contrastText: "#0a0a0a",
  },
  secondary: {
    main: "#333",
  },
  background: {
    default: "#0a0a0a",
    paper: "#1a1a1a",
  },
  text: {
    primary: "#fafafa",
    secondary: "#999",
    disabled: "#666",
  },
  warning: {
    main: "#f59e0b",
  },
  error: {
    main: "#ef4444",
  },
  divider: "#333",
};

const lightPalette = {
  mode: "light" as PaletteMode,
  primary: {
    main: "#15803d",
    dark: "#166534",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#d4d4d4",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
  },
  text: {
    primary: "#171717",
    secondary: "#525252",
    disabled: "#737373",
  },
  warning: {
    main: "#b45309",
  },
  error: {
    main: "#b91c1c",
  },
  divider: "#d4d4d4",
};

const createAppTheme = (mode: PaletteMode): Theme => {
  const isDark = mode === "dark";
  const palette = isDark ? darkPalette : lightPalette;
  const borderColor = isDark ? "#333" : "#e5e5e5";
  const surfaceColor = isDark ? "#1a1a1a" : "#ffffff";

  return createTheme({
    palette,
    ...sharedConfig,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          },
          "#root": {
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: surfaceColor,
            borderBottom: `1px solid ${borderColor}`,
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: surfaceColor,
            borderTop: `1px solid ${borderColor}`,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: surfaceColor,
            border: `1px solid ${borderColor}`,
            borderRadius: 16,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            borderBottom: `1px solid ${borderColor}`,
            borderRadius: 0,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor },
              "&:hover fieldset": { borderColor },
              "&.Mui-focused fieldset": { borderColor: palette.primary.main },
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? "0 4px 12px rgba(34, 197, 94, 0.3)"
              : "0 4px 12px rgba(22, 163, 74, 0.25)",
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: palette.primary.main,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            color: palette.text.secondary,
            "&.Mui-selected": {
              color: palette.primary.main,
            },
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: palette.text.secondary,
            "&.Mui-selected": {
              color: palette.primary.main,
            },
          },
        },
      },
    },
  });
};

export const darkTheme = createAppTheme("dark");
export const lightTheme = createAppTheme("light");
export const getTheme = (mode: PaletteMode): Theme => createAppTheme(mode);

// Default export for backwards compatibility
export default darkTheme;

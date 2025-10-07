import { createTheme } from "@mui/material/styles";
import { transform } from "next/dist/build/swc/generated-native";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#7070f0", contrastText: "#ffffff" },
    secondary: { main: "#ffc85e" },
    text: { primary: "#222222", secondary: "#666666" },
    background: { default: "#ffffff", paper: "#ffffff" },
    divider: "#ececee",
  },

  typography: {
    fontFamily:
      "var(--font-mulish), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },

  shape: { borderRadius: 10 },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--color-custom-card)",
          color: "var(--color-foreground)",
          borderColor: "var(--color-border)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "var(--color-custom-nav)",
          color: "var(--color-custom-fg)",
        },
      },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: "var(--color-border)" } },
    },


    // ================== INPUTS ==================
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
        slotProps: { inputLabel: { shrink: true } },
      } as any,
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
            fontFamily: "var(--font-mulish)",
            fontWeight: 700,
            color: "var(--color-custom-fg)",
            marginBottom: "0.25rem",
            transform: "none",
        },
        shrink: {
            transform: "translate(2rem, -0.57rem) scale(0.75)",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "var(--radius-round)",
          backgroundColor: "transparent",
          color: "var(--color-custom-fg)",
          minWidth: 0,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-custom-fg)",
            borderWidth: "2px",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-custom-fg)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-custom-primary)",
            boxShadow: "0 0 0 3px color-mix(in oklab, var(--color-custom-primary) 25%, transparent)",
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: "oklch(60% 0.22 25)",
          },
          "&.Mui-disabled": {
            backgroundColor: "color-mix(in oklab, var(--card) 80%, var(--background))",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border)" },
          },
        },

        notchedOutline: {
            legend: { margin: "0 0 0 1.1rem" },
        },

        input: {
          fontFamily: "var(--font-mulish)",
          fontWeight: 500,
          
          // hide spinners for numbers
          "&[type=number]::-webkit-outer-spin-button, &[type=number]::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
          "&[type=number]": {
            MozAppearance: "textfield",
          },
        },
        adornedStart: { paddingLeft: "1rem" },
        adornedEnd: { paddingRight: "1rem" },
      },
    },

    MuiInputAdornment: {
        styleOverrides: {
            root: {
            color: "var(--color-custom-fg)",
            "& .MuiIconButton-root": {
                padding: 6,
                color: "var(--color-custom-fg)",
            },
            },
        },
    },
    

    // ================== BUTTONS ==================
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "var(--radius-round)",
          border: "2px solid var(--color-custom-primary)",
          fontWeight: 700,

          ["&:has(.MuiButton-startIcon), &:has(.MuiButton-endIcon)"]: {
            backgroundColor: "transparent",
            color: "var(--color-custom-fg)",
            border: "2px solid var(--color-custom-fg)",
            fontFamily: "var(--font-mulish)",
            gap: "0.75rem",
            "& .MuiButton-startIcon, & .MuiButton-endIcon": {
              margin: 0,
              "& > *:nth-of-type(1)": { fontSize: "1.25rem" },
            },
            "&:hover": {
              backgroundColor: "var(--color-custom-fg)",
              color: "var(--color-custom-bg)",
            },
          },
        },

        containedPrimary: {
          backgroundColor: "var(--color-custom-primary)",
          color: "var(--color-custom-bg)",
          "&:hover": {
            backgroundColor: "transparent",
            color: "var(--color-custom-primary)",
          },
          "&.Mui-disabled": {
            border: "2px solid var(--color-custom-fg-2)",
            filter: "grayscale(0.2) opacity(0.7)",
          },
        },
        outlinedPrimary: {
          borderColor: "var(--color-custom-primary)",
          color: "var(--color-custom-primary)",
          "&:hover": {
            backgroundColor: "var(--color-custom-primary)",
            color: "var(--color-custom-bg)"
          },
        },
        textPrimary: {
          color: "var(--color-custom-primary)",
        },

      },
    },

    // 
    MuiLinearProgress: {
        styleOverrides: {
            root: {
                color: "var(--color-custom-fg)",
            }
        }
    }
  },
});

export default theme;
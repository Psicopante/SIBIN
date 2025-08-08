import { useSelector, useDispatch } from "react-redux";
import { createTheme } from "@mui/material/styles";
import { createContext, useMemo } from "react";
import { toggleThemeMode } from "../state/themeSlice";
// color design tokens export
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        backGround: {
          100: "#141b2d",
          200: "#bdbdbd",
        },
        whiteAccent: {
          50: "#292929",
          100: "#464646",
          200: "#525252",
          300: "#7c7c7c",
          400: "#989898",
          500: "#bdbdbd",
          600: "#656565",
          700: "#dcdcdc",
          800: "#efefef",
          900: "#3d3d3d",
          950: "#fafafa",
        },
        tecnico: {
          50: "#002f2f",
          100: "#004d4d",
          200: "#006064",
          300: "#007b8a",
          400: "#00bcd4",
          500: "#0097a7",
          600: "#26c6da",
          700: "#0097a7",
          800: "#80deea",
          900: "#b2ebf2",
          950: "#e0f7fa",
        },
        desert: {
          50: "#fbf7ef",
          100: "#f4e8d1",
          200: "#e9cf9e",
          300: "#ddb26c",
          400: "#d59b4a",
          500: "#cb7e35",
          600: "#b1602b",
          700: "#964727",
          800: "#7a3a26",
          900: "#653122",
          950: "#39180f",
        },
        gov: {
          50: "#f0fafb",
          100: "#d8f2f5",
          200: "#b5e3ec",
          300: "#67c4d6",
          400: "#49b1c7",
          500: "#2d94ad",
          600: "#287892",
          700: "#276277",
          800: "#275263",
          900: "#254554",
          950: "#b5e3ec",
        },
        pacificBlue: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a6f1fb",
          300: "#68e6f8",
          400: "#24d1ec",
          500: "#08b4d2",
          600: "#0a99bd",
          700: "#0f728f",
          800: "#165d74",
          900: "#174d62",
          950: "#083344",
        },
        black: {
          50: "#000000",
          100: "#3d3d3d",
          200: "#454545",
          300: "#4f4f4f",
          400: "#5d5d5d",
          500: "#6d6d6d",
          600: "#888888",
          700: "#b0b0b0",
          800: "#d1d1d1",
          900: "#e7e7e7",
          950: "#f6f6f6",
        },
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414",
        },
        primary: {
          100: "#d0d1d5",
          200: "#a1a4ab",
          300: "#727681",
          400: "#1F2A40",
          500: "#141b2d",
          600: "#101624",
          700: "#0c101b",
          800: "#080b12",
          900: "#040509",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        blueAccent: {
          100: "#e1e2fe",
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#868dfb",
          500: "#6870fa",
          600: "#535ac8",
          700: "#3e4396",
          800: "#2a2d64",
          900: "#151632",
        },
      }
    : {
        backGround: {
          100: "#efefef",
          200: "#141b2d",
        },
        whiteAccent: {
          50: "#fafafa",
          100: "#efefef",
          200: "#dcdcdc",
          300: "#bdbdbd",
          400: "#989898",
          500: "#7c7c7c",
          600: "#656565",
          700: "#525252",
          800: "#464646",
          900: "#3d3d3d",
          950: "#292929",
        },
        tecnico: {
          50: "#e0f7fa",
          100: "#b2ebf2",
          200: "#80deea",
          300: "#4dd0e1",
          400: "#26c6da",
          500: "#0097a7",
          600: "#00bcd4",
          700: "#0097a7",
          800: "#006064",
          900: "#004d4d",
          950: "#002f2f",
        },
        desert: {
          50: "#fbf7ef",
          100: "#f4e8d1",
          200: "#e9cf9e",
          300: "#ddb26c",
          400: "#d59b4a",
          500: "#cb7e35",
          600: "#b1602b",
          700: "#964727",
          800: "#7a3a26",
          900: "#653122",
          950: "#39180f",
        },
        gov: {
          50: "#132c39",
          100: "#254554",
          200: "#275263",
          300: "#276277",
          400: "#287892",
          500: "#2d94ad",
          600: "#49b1c7",
          700: "#67c4d6",
          800: "#b5e3ec",
          900: "#d8f2f5",
          950: "#67c4d6",
        },
        black: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#000000",
        },
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3D3D3D",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#A3A3A3",
          800: "#C2C2C2",
          900: "#E0E0E0",
        },
        primary: {
          100: "#E9ECEF",
          200: "#E0E0E0",
          300: "#D1D1D1",
          400: "#EFEDE8", // manually changed
          500: "#D1D1D1", //"#2C92B5",
          600: "#1F2A40",
          700: "#67C5D7",
          800: "#A1A4AB",
          900: "#F2F0F0",
        },
        greenAccent: {
          100: "#0F2922",
          200: "#1E5245",
          300: "#2E7C67",
          400: "#3DA58A",
          500: "#4CCEAC",
          600: "#70D8BD",
          700: "#94E2CD",
          800: "#B7EBDE",
          900: "#DBF5EE",
        },
        redAccent: {
          100: "#2C100F",
          200: "#58201E",
          300: "#832F2C",
          400: "#AF3F3B",
          500: "#DB4F4A",
          600: "#E2726E",
          700: "#E99592",
          800: "#F1B9B7",
          900: "#F8DCDB",
        },
        blueAccent: {
          100: "#151632",
          200: "#2A2D64",
          300: "#3E4396",
          400: "#67C5D7",
          500: "#6870FA",
          600: "#868DFB",
          700: "#A4A9FC",
          800: "#C3C6FD",
          900: "#E1E2FE",
        },
        pacificBlue: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a6f1fb",
          300: "#68e6f8",
          400: "#24d1ec",
          500: "#08b4d2",
          600: "#0a99bd",
          700: "#0f728f",
          800: "#165d74",
          900: "#174d62",
          950: "#083344",
        },
      }),
});
// mui theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            // palette values for dark mode
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.gov[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[500],
            },
          }
        : {
            // palette values for light mode
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.gov[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#FAFAFA",
            },
          }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
      h7: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 12,
      },
    },
  };
};
// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.themeMode.themeMode);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => dispatch(toggleThemeMode()),
    }),
    [dispatch]
  );

  const theme = useMemo(() => createTheme(themeSettings(themeMode)), [themeMode]);

  return [theme, colorMode];
};

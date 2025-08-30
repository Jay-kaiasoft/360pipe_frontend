import { createTheme, ThemeProvider } from '@mui/material/styles';


const colors = {
  primary: "#ffd600",        // yellow
  primaryRgb: "255, 214, 0",
  secondary: "#0f55dc",      // blue
  secondaryRgb: "15, 83, 220",

  primaryTwo: "#d44a00",
  primaryThree: "#9a4497",
  primaryFour: "#ff6a00",
  primaryFive: "#1438bc",

  heading: "#111112",
  headingTwo: "#0c111d",
  headingThree: "#16140c",
  headingFour: "#212877",

  default: "#6b7280",
  defaultTwo: "#9ca3af",

  white: "#fff",
  black: "#000",
  body: "#eaeef0",
};

const MuiTheme = () =>
  createTheme({
    palette: {
      primary: {
        main: colors.primary,        // yellow
        contrastText: colors.black,
      },
      secondary: {
        main: colors.secondary,      // blue
        contrastText: colors.white,
      },
      text: {
        primary: colors.heading,
        secondary: colors.secondary,
        disabled: colors.defaultTwo,
      },
      error: {
        main: "#FF4D66",
      },
      warning: {
        main: "#ffed65",
      },
      success: {
        main: "#16a34a",
      },
      background: {
        default: colors.default,
        paper: colors.white,
      },
      custom: {
        primaryTwo: colors.primaryTwo,
        primaryThree: colors.primaryThree,
        primaryFour: colors.primaryFour,
        primaryFive: colors.primaryFive,
        headingTwo: colors.headingTwo,
        headingThree: colors.headingThree,
        headingFour: colors.headingFour,
        defaultTwo: colors.defaultTwo,
      },
    },
});

const MuiThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={MuiTheme}>
      {children}
    </ThemeProvider>
  );
};


export default MuiThemeProvider;

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: true,
  palette: {
    primary: { main: "#2E7D32" },
    secondary: { main: "#FBC02D" },
  },
});

export default theme;

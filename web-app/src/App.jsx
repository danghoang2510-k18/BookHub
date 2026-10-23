import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AppRoutes from "./routes/AppRoutes";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2f6253", dark: "#234c40", light: "#e2eee7", contrastText: "#ffffff" },
    secondary: { main: "#db9258", dark: "#b96e37", light: "#faeadb" },
    background: { default: "#f7f6f1", paper: "#ffffff" },
    text: { primary: "#24332e", secondary: "#75817b" },
    divider: "#e8ebe5",
    error: { main: "#c75b53" },
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
    h1: { fontWeight: 800, letterSpacing: "-0.045em" },
    h2: { fontWeight: 800, letterSpacing: "-0.035em" },
    h3: { fontWeight: 750, letterSpacing: "-0.025em" },
    h4: { fontWeight: 750, letterSpacing: "-0.025em" },
    h5: { fontWeight: 750, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 18, minHeight: 42, boxShadow: "none" },
        containedPrimary: { "&:hover": { boxShadow: "0 8px 18px rgba(47,98,83,.18)" } },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 18 } } },
    MuiCard: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundColor: "#fff", "& fieldset": { borderColor: "#e1e7e1" }, "&:hover fieldset": { borderColor: "#b8c9be" } },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;

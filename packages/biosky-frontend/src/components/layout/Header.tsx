import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DarkMode,
  LightMode,
  SettingsBrightness,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout } from "../../store/authSlice";
import { openLoginModal, setThemeMode, type ThemeMode } from "../../store/uiSlice";

export function Header() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const themeMode = useAppSelector((state) => state.ui.themeMode);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleLogin = () => {
    dispatch(openLoginModal());
  };

  const cycleTheme = () => {
    const nextMode: ThemeMode =
      themeMode === "system" ? "light" : themeMode === "light" ? "dark" : "system";
    dispatch(setThemeMode(nextMode));
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case "light":
        return <LightMode />;
      case "dark":
        return <DarkMode />;
      default:
        return <SettingsBrightness />;
    }
  };

  const getThemeTooltip = () => {
    switch (themeMode) {
      case "light":
        return "Light mode (click for dark)";
      case "dark":
        return "Dark mode (click for system)";
      default:
        return "System theme (click for light)";
    }
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "primary.main" }}
        >
          BioSky
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={getThemeTooltip()}>
            <IconButton
              onClick={cycleTheme}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              {getThemeIcon()}
            </IconButton>
          </Tooltip>
          {user ? (
            <>
              <Typography
                variant="body2"
                sx={{ color: "primary.main", fontWeight: 500 }}
              >
                {user.handle ? `@${user.handle}` : user.did}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleLogin}
            >
              Log in
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

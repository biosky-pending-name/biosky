import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout } from "../../store/authSlice";
import { openLoginModal } from "../../store/uiSlice";

export function Header() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleLogin = () => {
    dispatch(openLoginModal());
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
                color="inherit"
                size="small"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
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

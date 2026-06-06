"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Tooltip from "@mui/material/Tooltip";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { usePrinter } from "@/context/PrinterContext";

export default function TopNav() {
  const router = useRouter();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const { connected, connecting, connect, disconnect } = usePrinter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split("@")[0]
    ?? "Admin";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setAnchor(null);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: "transparent",
        "--AppBar-background": "transparent",
        boxShadow: "none",
        mt: 1.5,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 4 }, minHeight: 64 }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "#2E7D32", lineHeight: 1.1, letterSpacing: "0.02em" }}
            >
              Katas PH
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#FBC02D", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              POS System
            </Typography>
          </Box>
        </Box>

        {/* Right side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Printer button */}
          <Tooltip title={connected ? "Printer Connected — Click to disconnect" : "Connect Printer"} arrow>
            <Box
              onClick={connected ? disconnect : connect}
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: 1.5, py: 0.75, borderRadius: 2, cursor: "pointer",
                border: connected ? "1.5px solid #2E7D32" : "1.5px solid #e0e0e0",
                backgroundColor: connected ? "#f1f8f1" : "#ffffff",
                transition: "all 0.15s",
                "&:hover": { borderColor: "#2E7D32", backgroundColor: "#f1f8f1" },
                opacity: connecting ? 0.6 : 1,
                pointerEvents: connecting ? "none" : "auto",
              }}
            >
              <PrintOutlinedIcon sx={{ fontSize: 16, color: connected ? "#2E7D32" : "#9e9e9e" }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: connected ? "#2E7D32" : "#9e9e9e", display: { xs: "none", sm: "block" } }}>
                {connecting ? "Connecting…" : connected ? "Printer On" : "Connect Printer"}
              </Typography>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: connected ? "#2E7D32" : "#e0e0e0", flexShrink: 0 }} />
            </Box>
          </Tooltip>

          {/* User menu */}
          <Box>
            <IconButton
              onClick={(e) => setAnchor(e.currentTarget)}
              disableRipple
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                borderRadius: 2, px: 1.5, py: 0.75,
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <Avatar sx={{ bgcolor: "#2E7D32", width: 34, height: 34, fontSize: "0.8rem", fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Typography variant="body2" sx={{ color: "#212121", fontWeight: 600, display: { xs: "none", sm: "block" } }}>
                {displayName}
              </Typography>
              <KeyboardArrowDownIcon
                sx={{
                  fontSize: 18, color: "#757575",
                  display: { xs: "none", sm: "block" },
                  transition: "transform 0.2s",
                  transform: anchor ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </IconButton>

            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={() => setAnchor(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: { mt: 1, minWidth: 200, borderRadius: 2, border: "1px solid #f0f0f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "visible" },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#212121" }}>
                  {displayName}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {user?.email ?? ""}
                </Typography>
              </Box>

              <Divider />

              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.25, px: 2, gap: 1.5, "&:hover": { backgroundColor: "#fff8f8" } }}
              >
                <ListItemIcon sx={{ minWidth: "unset" }}>
                  <LogoutOutlinedIcon fontSize="small" sx={{ color: "#d32f2f" }} />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#d32f2f" }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

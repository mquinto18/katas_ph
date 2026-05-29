"use client";

import { useState } from "react";
import Image from "next/image";
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
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface TopNavProps {
  username?: string;
}

export default function TopNav({ username = "Admin" }: TopNavProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

        {/* User section */}
        <Box>
          <IconButton
            onClick={(e) => setAnchor(e.currentTarget)}
            disableRipple
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#2E7D32",
                width: 34,
                height: 34,
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                color: "#212121",
                fontWeight: 600,
                display: { xs: "none", sm: "block" },
              }}
            >
              {username}
            </Typography>
            <KeyboardArrowDownIcon
              sx={{
                fontSize: 18,
                color: "#757575",
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
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  border: "1px solid #f0f0f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  overflow: "visible",
                },
              },
            }}
          >
            {/* User info header */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#212121" }}>
                {username}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Administrator
              </Typography>
            </Box>

            <Divider />

            <MenuItem
              onClick={() => setAnchor(null)}
              sx={{ py: 1.25, px: 2, gap: 1.5, "&:hover": { backgroundColor: "#f9fbe7" } }}
            >
              <ListItemIcon sx={{ minWidth: "unset" }}>
                <SettingsOutlinedIcon fontSize="small" sx={{ color: "#2E7D32" }} />
              </ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Settings
              </Typography>
            </MenuItem>

            <MenuItem
              onClick={() => setAnchor(null)}
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
      </Toolbar>
    </AppBar>
  );
}

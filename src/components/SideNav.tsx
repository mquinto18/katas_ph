"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardOutlinedIcon },
  { href: "/orders",    label: "Order",     Icon: ReceiptLongOutlinedIcon },
  { href: "/inventory", label: "Inventory", Icon: Inventory2OutlinedIcon },
  { href: "/settings",  label: "Settings",  Icon: SettingsOutlinedIcon },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        width: 72,
        flexShrink: 0,
        alignSelf: "stretch",
        minHeight: "100%",
        backgroundColor: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(8px)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        gap: 0.5,
      }}
    >
      {/* Logo */}
      <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image src="/logo.png" alt="Katas PH" width={44} height={44} priority />
      </Box>

      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href;
        return (
          <Tooltip key={href} title={label} placement="right" arrow>
            <Box
              component={Link}
              href={href}
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                textDecoration: "none",
                backgroundColor: isActive ? "#f1f8f1" : "transparent",
                border: isActive ? "1.5px solid #c8e6c9" : "1.5px solid transparent",
                transition: "all 0.18s",
                "&:hover": {
                  backgroundColor: "#f1f8f1",
                  border: "1.5px solid #c8e6c9",
                },
              }}
            >
              <Icon
                sx={{
                  fontSize: 22,
                  color: isActive ? "#2E7D32" : "#9e9e9e",
                  transition: "color 0.18s",
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.55rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#2E7D32" : "#9e9e9e",
                  lineHeight: 1,
                  transition: "color 0.18s",
                }}
              >
                {label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

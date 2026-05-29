"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";

const CATEGORIES = [
  { label: "All Menus", value: "all" },
  { label: "Cafe & Drinks", value: "cafe" },
  { label: "Meals", value: "meals" },
  { label: "Food & Snack", value: "snack" },
];

export default function CategoryNav() {
  const [active, setActive] = useState("all");

  return (
    <Box
      sx={{
        background: "transparent",
        px: { xs: 2, sm: 4 },
        pt: 2,
        pb: 0,
        display: "flex",
        alignItems: "flex-end",
        gap: "6px",
        width: "fit-content",
        borderBottom: "2px solid #ffffff",
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.value;
        return (
          <ButtonBase
            key={cat.value}
            onClick={() => setActive(cat.value)}
            disableRipple
            sx={{
              borderRadius: "10px 10px 0 0",
              px: { xs: 2, sm: 3 },
              py: 1.1,
              backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
              borderTop: isActive
                ? "1.5px solid rgba(0,0,0,0.08)"
                : "1.5px solid transparent",
              borderLeft: isActive
                ? "1.5px solid rgba(0,0,0,0.08)"
                : "1.5px solid transparent",
              borderRight: isActive
                ? "1.5px solid rgba(0,0,0,0.08)"
                : "1.5px solid transparent",
              mb: "-2px",
              zIndex: isActive ? 1 : 0,
              position: "relative",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: isActive
                  ? "#ffffff"
                  : "rgba(255,255,255,0.7)",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#2E7D32" : "#555555",
                whiteSpace: "nowrap",
                fontSize: "0.85rem",
              }}
            >
              {cat.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

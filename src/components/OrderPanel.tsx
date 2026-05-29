"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";

const ORDER_TYPES = [
  { value: "dine-in",  label: "Dine-In",  Icon: DinnerDiningIcon },
  { value: "takeout",  label: "Take Out",  Icon: ShoppingBagOutlinedIcon },
  { value: "delivery", label: "Delivery",  Icon: DeliveryDiningIcon },
];

export default function OrderPanel() {
  const [orderType, setOrderType] = useState("dine-in");

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 320, lg: 360 },
        flexShrink: 0,
        backgroundColor: "#ffffff",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      {/* Tab header — matches chrome-tab style of CategoryNav */}
      <Box
        sx={{
          px: 2.5,
          pt: 2,
          pb: 0,
          display: "flex",
          alignItems: "flex-end",
          borderBottom: "2px solid #ffffff",
          background: "linear-gradient(135deg, #c8e6c9 0%, #f0f4c3 60%, #fff9c4 100%)",
        }}
      >
        <Box
          sx={{
            borderRadius: "10px 10px 0 0",
            px: 3,
            py: 1.1,
            backgroundColor: "#ffffff",
            borderTop: "1.5px solid rgba(0,0,0,0.08)",
            borderLeft: "1.5px solid rgba(0,0,0,0.08)",
            borderRight: "1.5px solid rgba(0,0,0,0.08)",
            mb: "-2px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.85rem", whiteSpace: "nowrap" }}
          >
            Order Summary
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Order type cards */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: "#9e9e9e", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          Order Type
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, mt: 1.5 }}>
          {ORDER_TYPES.map(({ value, label, Icon }) => {
            const isActive = orderType === value;
            return (
              <ButtonBase
                key={value}
                onClick={() => setOrderType(value)}
                sx={{
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.75,
                  py: 1.75,
                  px: 1,
                  borderRadius: 2.5,
                  border: isActive ? "2px solid #2E7D32" : "1.5px solid #e8e8e8",
                  backgroundColor: isActive ? "#f1f8f1" : "#fafafa",
                  transition: "all 0.18s",
                  "&:hover": {
                    borderColor: "#2E7D32",
                    backgroundColor: "#f1f8f1",
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: 26,
                    color: isActive ? "#2E7D32" : "#9e9e9e",
                    transition: "color 0.18s",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#2E7D32" : "#757575",
                    fontSize: "0.72rem",
                    lineHeight: 1,
                  }}
                >
                  {label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      <Divider />

      {/* Empty order state */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          gap: 1,
          color: "#bdbdbd",
        }}
      >
        <ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "#e0e0e0" }} />
        <Typography variant="body2" sx={{ color: "#bdbdbd", fontWeight: 500 }}>
          No items yet
        </Typography>
        <Typography variant="caption" sx={{ color: "#d0d0d0", textAlign: "center" }}>
          Add products from the menu to start an order
        </Typography>
      </Box>
    </Box>
  );
}

"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import ProductCard, { type Product, type CategoryValue } from "./ProductCard";

const CATEGORIES = [
  { label: "All Menus", value: "all" },
  { label: "Cafe & Drinks", value: "cafe" },
  { label: "Meals", value: "meals" },
  { label: "Food & Snack", value: "snack" },
];

const PRODUCTS: Product[] = [
  { id: 1,  name: "Fresh Mango Juice",    category: "cafe",   price: 65,  available: true,  emoji: "🥭", bgColor: "linear-gradient(135deg,#FFE082,#FFB300)" },
  { id: 2,  name: "Buko Pandan Shake",    category: "cafe",   price: 75,  available: true,  emoji: "🥥", bgColor: "linear-gradient(135deg,#A5D6A7,#388E3C)" },
  { id: 3,  name: "Calamansi Juice",      category: "cafe",   price: 55,  available: true,  emoji: "🍋", bgColor: "linear-gradient(135deg,#FFF59D,#F9A825)" },
  { id: 4,  name: "Strawberry Shake",     category: "cafe",   price: 85,  available: false, emoji: "🍓", bgColor: "linear-gradient(135deg,#F48FB1,#C62828)" },
  { id: 5,  name: "Four Seasons Juice",   category: "cafe",   price: 70,  available: true,  emoji: "🍊", bgColor: "linear-gradient(135deg,#FFCC80,#EF6C00)" },
  { id: 6,  name: "Green Mango Juice",    category: "cafe",   price: 60,  available: true,  emoji: "🍏", bgColor: "linear-gradient(135deg,#CCFF90,#33691E)" },
  { id: 7,  name: "Watermelon Juice",     category: "snack",  price: 65,  available: false, emoji: "🍉", bgColor: "linear-gradient(135deg,#EF9A9A,#B71C1C)" },
  { id: 8,  name: "Pineapple Juice",      category: "cafe",   price: 60,  available: true,  emoji: "🍍", bgColor: "linear-gradient(135deg,#FFF176,#F57F17)" },
  { id: 9,  name: "Grilled Chicken Rice", category: "meals",  price: 150, available: true,  emoji: "🍗", bgColor: "linear-gradient(135deg,#FFCCBC,#BF360C)" },
  { id: 10, name: "Banana Chips",         category: "snack",  price: 40,  available: true,  emoji: "🍌", bgColor: "linear-gradient(135deg,#FFF9C4,#F9A825)" },
];

export default function ProductsView() {
  const [active, setActive] = useState("all");

  const filtered = active === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === (active as CategoryValue));

  return (
    <>
      {/* Category tabs */}
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
                borderTop: isActive ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
                borderLeft: isActive ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
                borderRight: isActive ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
                mb: "-2px",
                zIndex: isActive ? 1 : 0,
                position: "relative",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
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

      {/* Product grid */}
      <Box sx={{ flex: 1, backgroundColor: "#ffffff", p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#212121" }}>
            {filtered.length}
          </Typography>
          <Typography variant="body2" sx={{ color: "#9e9e9e", fontWeight: 500 }}>
            Products
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 2,
          }}
        >
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Box>
      </Box>
    </>
  );
}

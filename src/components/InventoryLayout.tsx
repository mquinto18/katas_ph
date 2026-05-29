"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddIcon from "@mui/icons-material/Add";
import { type Product, type CategoryValue, CATEGORY_LABELS } from "./ProductCard";
import AddProductModal from "./AddProductModal";

const CATEGORIES = [
  { label: "All Items", value: "all" },
  { label: "Cafe & Drinks", value: "cafe" },
  { label: "Meals", value: "meals" },
  { label: "Food & Snack", value: "snack" },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 1,  name: "Fresh Mango Juice",    category: "cafe",   price: 65,  available: true,  image: "" },
  { id: 2,  name: "Buko Pandan Shake",    category: "cafe",   price: 75,  available: true,  image: "" },
  { id: 3,  name: "Calamansi Juice",      category: "cafe",   price: 55,  available: true,  image: "" },
  { id: 4,  name: "Strawberry Shake",     category: "cafe",   price: 85,  available: false, image: "" },
  { id: 5,  name: "Four Seasons Juice",   category: "cafe",   price: 70,  available: true,  image: "" },
  { id: 6,  name: "Green Mango Juice",    category: "cafe",   price: 60,  available: true,  image: "" },
  { id: 7,  name: "Watermelon Juice",     category: "snack",  price: 65,  available: false, image: "" },
  { id: 8,  name: "Pineapple Juice",      category: "cafe",   price: 60,  available: true,  image: "" },
  { id: 9,  name: "Grilled Chicken Rice", category: "meals",  price: 150, available: true,  image: "" },
  { id: 10, name: "Banana Chips",         category: "snack",  price: 40,  available: true,  image: "" },
];

export default function InventoryLayout() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAddProduct = (product: Omit<Product, "id">) => {
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setProducts((prev) => [...prev, { ...product, id: newId }]);
  };

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === (activeCategory as CategoryValue));

  const toggleAvailability = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );
  };

  const totalAvailable = products.filter((p) => p.available).length;
  const totalUnavailable = products.filter((p) => !p.available).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, height: 0, minHeight: "100%" }}>

      {/* ── Tab bar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          background: "transparent",
          px: { xs: 2, sm: 4 },
          pt: 2,
          pb: 0,
          borderBottom: "2px solid #ffffff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <ButtonBase
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
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
                  "&:hover": { backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.7)" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? "#2E7D32" : "#555555", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                >
                  {cat.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>

        {/* Right: Inventory tab */}
        <Box
          sx={{
            borderRadius: "10px 10px 0 0",
            px: 3, py: 1.1,
            backgroundColor: "#ffffff",
            borderTop: "1.5px solid rgba(0,0,0,0.08)",
            borderLeft: "1.5px solid rgba(0,0,0,0.08)",
            borderRight: "1.5px solid rgba(0,0,0,0.08)",
            mb: "-2px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            Inventory
          </Typography>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ flex: 1, backgroundColor: "#ffffff", overflow: "auto", p: { xs: 2, sm: 3 } }}>

        {/* Stats row */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "flex-start" }}>
          {[
            { label: "Total Items",  value: products.length,   color: "#212121", bg: "#f5f5f5",  border: "#e0e0e0" },
            { label: "Available",    value: totalAvailable,    color: "#2E7D32", bg: "#f1f8f1",  border: "#c8e6c9" },
            { label: "Unavailable",  value: totalUnavailable,  color: "#c62828", bg: "#fce4ec",  border: "#f48fb1" },
          ].map(({ label, value, color, bg, border }) => (
            <Box
              key={label}
              sx={{ px: 3, py: 2, borderRadius: 2.5, backgroundColor: bg, border: `1.5px solid ${border}`, minWidth: 120 }}
            >
              <Typography variant="caption" sx={{ color: "#9e9e9e", fontWeight: 500 }}>{label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color, lineHeight: 1.2 }}>{value}</Typography>
            </Box>
          ))}
          <Box sx={{ ml: "auto" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddModalOpen(true)}
              sx={{
                borderRadius: 2.5, fontWeight: 700, textTransform: "none",
                backgroundColor: "#2E7D32", boxShadow: "none", px: 2.5, py: 1.2,
                "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" },
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {/* Table header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 0.8fr 1fr 0.8fr",
            px: 2,
            py: 1,
            backgroundColor: "#f9f9f9",
            borderRadius: 2,
            mb: 1,
          }}
        >
          {["Product", "Category", "Price", "Status", "Availability"].map((h) => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {h}
            </Typography>
          ))}
        </Box>

        {/* Table rows */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {filtered.map((product) => (
            <Box
              key={product.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr 0.8fr 1fr 0.8fr",
                alignItems: "center",
                px: 2,
                py: 1.5,
                borderRadius: 2.5,
                border: "1px solid #f0f0f0",
                backgroundColor: product.available ? "#ffffff" : "#fafafa",
                transition: "box-shadow 0.15s",
                "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
              }}
            >
              {/* Product */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 2,
                    backgroundColor: "#f5f5f5",
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#bdbdbd", fontWeight: 700 }}>
                      {product.name.charAt(0).toUpperCase()}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#212121" }}>
                  {product.name}
                </Typography>
              </Box>

              {/* Category */}
              <Typography variant="body2" sx={{ color: "#616161" }}>
                {CATEGORY_LABELS[product.category]}
              </Typography>

              {/* Price */}
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32" }}>
                ₱{product.price.toFixed(2)}
              </Typography>

              {/* Status chip */}
              <Box>
                <Chip
                  icon={product.available
                    ? <CheckCircleOutlinedIcon sx={{ fontSize: "14px !important" }} />
                    : <CancelOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                  label={product.available ? "Available" : "Unavailable"}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    backgroundColor: product.available ? "#e8f5e9" : "#fce4ec",
                    color: product.available ? "#2E7D32" : "#c62828",
                    "& .MuiChip-icon": { color: product.available ? "#2E7D32" : "#c62828" },
                  }}
                />
              </Box>

              {/* Toggle */}
              <Switch
                checked={product.available}
                onChange={() => toggleAvailability(product.id)}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#2E7D32" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#2E7D32" },
                }}
              />
            </Box>
          ))}
        </Box>

        {filtered.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 1 }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 48, color: "#e0e0e0" }} />
            <Typography variant="body2" sx={{ color: "#bdbdbd", fontWeight: 500 }}>No items in this category</Typography>
          </Box>
        )}
      </Box>

      <AddProductModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddProduct}
      />
    </Box>
  );
}

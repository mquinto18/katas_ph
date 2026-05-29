"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ProductModal from "./ProductModal";

export type CategoryValue = "cafe" | "meals" | "snack";

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  cafe: "Cafe & Drinks",
  meals: "Meals",
  snack: "Food & Snack",
};

export interface Product {
  id: number;
  name: string;
  category: CategoryValue;
  price: number;
  available: boolean;
  image: string;
}

interface Props {
  product: Product;
  onAddToOrder?: (product: Product, quantity: number, addons: string[]) => void;
}

export default function ProductCard({ product, onAddToOrder }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card
        elevation={0}
        onClick={() => setModalOpen(true)}
        sx={{
          borderRadius: 3,
          border: "1px solid #f0f0f0",
          backgroundColor: "#ffffff",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            transform: "translateY(-2px)",
          },
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Product image */}
        <Box
          sx={{
            height: 140,
            borderRadius: "12px 12px 0 0",
            overflow: "hidden",
            backgroundColor: "#f5f5f5",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Typography variant="h4" sx={{ color: "#bdbdbd", fontWeight: 700 }}>
              {product.name.charAt(0).toUpperCase()}
            </Typography>
          )}
        </Box>

        <CardContent sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: "#9e9e9e", fontWeight: 500 }}>
            {CATEGORY_LABELS[product.category]}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#212121", lineHeight: 1.3, mb: 0.5 }}>
            {product.name}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Chip
              label={product.available ? "Available" : "Unavailable"}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.68rem",
                fontWeight: 600,
                backgroundColor: product.available ? "#e8f5e9" : "#fce4ec",
                color: product.available ? "#2E7D32" : "#c62828",
                border: "none",
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#2E7D32", fontSize: "0.95rem" }}>
              ₱{product.price.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <ProductModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddToOrder={(p, qty, addons) => {
          onAddToOrder?.(p, qty, addons);
          setModalOpen(false);
        }}
      />
    </>
  );
}

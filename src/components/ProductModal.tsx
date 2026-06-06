"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { type Product } from "./ProductCard";
import { useCategories } from "@/context/CategoriesContext";

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
  onAddToOrder: (product: Product, quantity: number) => void;
}

export default function ProductModal({ product, open, onClose, onAddToOrder }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { categoryMap } = useCategories();

  const total = product.price * quantity;

  const handleAdd = () => {
    onAddToOrder(product, quantity);
    setQuantity(1);
    onClose();
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            height: "58vh",
            display: "flex",
            flexDirection: "row",
          },
        },
      }}
    >
      {/* Left: product image */}
      <Box
        sx={{
          width: 260, flexShrink: 0, backgroundColor: "#f5f5f5",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Typography variant="h1" sx={{ color: "#bdbdbd", fontWeight: 700 }}>
            {product.name.charAt(0).toUpperCase()}
          </Typography>
        )}
      </Box>

      {/* Right: details */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Close button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, pt: 1.5, flexShrink: 0 }}>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#bdbdbd", "&:hover": { color: "#424242" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, pt: 0.5, pb: 3 }}>
          <Typography variant="caption" sx={{ color: "#9e9e9e", fontWeight: 500 }}>
            {categoryMap[product.category] ?? product.category}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.25, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#212121" }}>
              {product.name}
            </Typography>
            <Chip
              label={product.available ? "Available" : "Unavailable"}
              size="small"
              sx={{
                backgroundColor: product.available ? "#e8f5e9" : "#fce4ec",
                color: product.available ? "#2E7D32" : "#c62828",
                fontWeight: 600, fontSize: "0.7rem",
              }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Quantity */}
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#424242", mb: 1.25 }}>
            Quantity
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              size="small"
              sx={{ border: "1.5px solid #e0e0e0", borderRadius: 1.5, width: 34, height: 34, "&:hover": { borderColor: "#2E7D32", color: "#2E7D32" } }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>
              {quantity}
            </Typography>
            <IconButton
              onClick={() => setQuantity((q) => q + 1)}
              size="small"
              sx={{ border: "1.5px solid #2E7D32", borderRadius: 1.5, width: 34, height: 34, color: "#2E7D32", "&:hover": { backgroundColor: "#f1f8f1" } }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#9e9e9e", ml: "auto" }}>
              ₱{product.price.toFixed(2)} each
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ flexShrink: 0, px: 3, py: 2, borderTop: "1px solid #f0f0f0", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" sx={{ color: "#9e9e9e", fontWeight: 500 }}>Total</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#2E7D32", lineHeight: 1 }}>
              ₱{total.toFixed(2)}
            </Typography>
          </Box>
          <Button
            fullWidth variant="contained" disabled={!product.available} onClick={handleAdd}
            sx={{
              py: 1.3, borderRadius: 2.5, fontWeight: 700, fontSize: "0.95rem", textTransform: "none",
              backgroundColor: "#2E7D32", boxShadow: "none",
              "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" },
              "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" },
            }}
          >
            {product.available ? "Add to Order" : "Not Available"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

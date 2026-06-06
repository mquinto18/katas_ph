"use client";

import { useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { type Product, type CategoryValue } from "./ProductCard";
import { useCategories } from "@/context/CategoriesContext";

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit: (updated: Product, imageFile?: File) => void;
}

export default function EditProductModal({ open, product, onClose, onEdit }: Props) {
  const { categories } = useCategories();
  const [form, setForm] = useState({
    name:      product?.name      ?? "",
    category:  (product?.category ?? "rice-meals") as CategoryValue,
    price:     product            ? String(product.price) : "",
    available: product?.available ?? true,
    image:     product?.image     ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => set("image", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Enter a valid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !product) return;
    onEdit(
      {
        id:        product.id,
        name:      form.name.trim(),
        category:  form.category,
        price:     Number(form.price),
        available: form.available,
        image:     form.image,
      },
      imageFile,
    );
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    setImageFile(undefined);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f0f0f0" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>
            Edit Product
          </Typography>
          <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
            Update the details for this item
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "#bdbdbd", "&:hover": { color: "#424242" }, borderRadius: 1.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Form */}
      <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

        {/* Preview */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: 2.5, backgroundColor: "#f5f5f5",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, border: "1px solid #ebebeb",
            }}
          >
            {form.image ? (
              <img src={form.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 28, color: "#d0d0d0" }} />
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: form.name ? "#1a1a1a" : "#bdbdbd" }}>
              {form.name || "Product name preview"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
              {form.price ? `₱${Number(form.price).toFixed(2)}` : "₱0.00"}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Image upload */}
        <Box>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddPhotoAlternateOutlinedIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: "none",
              borderColor: form.image ? "#2E7D32" : "#e0e0e0",
              color: form.image ? "#2E7D32" : "#9e9e9e",
              "&:hover": { borderColor: "#2E7D32", color: "#2E7D32", backgroundColor: "#f1f8f1" },
            }}
          >
            {form.image ? "Change Image" : "Upload Product Image"}
          </Button>
        </Box>

        {/* Name */}
        <TextField
          label="Product Name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          size="small"
          fullWidth
          sx={fieldSx}
        />

        {/* Category + Price */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            label="Category"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            size="small"
            fullWidth
            sx={fieldSx}
          >
            {categories.map((c) => (
              <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Price (₱)"
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            error={!!errors.price}
            helperText={errors.price}
            size="small"
            fullWidth
            sx={fieldSx}
          />
        </Box>

        {/* Available toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={form.available}
              onChange={(e) => set("available", e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#2E7D32" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#2E7D32" },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#424242" }}>
              {form.available ? "Available" : "Unavailable"}
            </Typography>
          }
        />
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, pb: 3, display: "flex", gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{
            py: 1.3, borderRadius: 2, fontWeight: 700, textTransform: "none",
            borderColor: "#e0e0e0", color: "#616161",
            "&:hover": { borderColor: "#bdbdbd", backgroundColor: "#f5f5f5" },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSubmit}
          sx={{
            py: 1.3, borderRadius: 2, fontWeight: 700, textTransform: "none",
            backgroundColor: "#2E7D32", boxShadow: "none",
            "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" },
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Dialog>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&.Mui-focused fieldset": { borderColor: "#2E7D32" },
  },
  "& label.Mui-focused": { color: "#2E7D32" },
};

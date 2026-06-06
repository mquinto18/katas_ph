"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AddIcon from "@mui/icons-material/Add";
import { useCategories } from "@/context/CategoriesContext";
import { supabase } from "@/lib/supabase";
import { type Category } from "@/lib/categoriesService";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ManageCategoriesModal({ open, onClose }: Props) {
  const { categories, add, remove } = useCategories();
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const toValue = (label: string) =>
    label.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) { setError("Category name is required"); return; }
    const value = toValue(label);
    if (categories.some((c) => c.value === value)) { setError("Category already exists"); return; }
    setAdding(true);
    try {
      await add(label, value);
      toast.success(`"${label}" category added!`);
      setNewLabel("");
      setError("");
    } catch {
      toast.error("Failed to add category.");
    }
    setAdding(false);
  };

  const openDeleteConfirm = async (cat: Category) => {
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category", cat.value);
    setProductCount(count ?? 0);
    setDeleteTarget(cat);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      toast(`"${deleteTarget.label}" category removed.`, {
        icon: " ",
        style: { background: "#e53935", color: "#fff" },
      });
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove category.");
    }
    setDeleting(false);
  };

  const handleClose = () => {
    setNewLabel("");
    setError("");
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #f0f0f0" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 }}>
              Manage Categories
            </Typography>
            <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
              Add or remove product categories
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#bdbdbd", "&:hover": { color: "#424242" }, borderRadius: 1.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Existing categories */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Current Categories
          </Typography>
          <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75, maxHeight: 240, overflowY: "auto", pr: 0.5 }}>
            {categories.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#bdbdbd", py: 1 }}>No categories yet.</Typography>
            ) : (
              categories.map((cat) => (
                <Box
                  key={cat.id}
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: 2, py: 1.25, borderRadius: 2,
                    border: "1px solid #f0f0f0", backgroundColor: "#fafafa",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                      {cat.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#bdbdbd" }}>
                      {cat.value}
                    </Typography>
                  </Box>
                  <Box
                    onClick={() => openDeleteConfirm(cat)}
                    sx={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: 1, cursor: "pointer",
                      color: "#d0d0d0", transition: "color 0.15s",
                      "&:hover": { color: "#e53935" },
                    }}
                  >
                    <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>

        <Divider sx={{ mx: 3, my: 2 }} />

        {/* Add new category */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Add New Category
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, alignItems: "flex-start" }}>
            <TextField
              size="small"
              placeholder="Category name"
              value={newLabel}
              onChange={(e) => { setNewLabel(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              error={!!error}
              helperText={error}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#2E7D32" },
                },
                "& label.Mui-focused": { color: "#2E7D32" },
              }}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={adding}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2, fontWeight: 700, textTransform: "none", whiteSpace: "nowrap",
                backgroundColor: "#2E7D32", boxShadow: "none", py: 1, px: 2,
                "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" },
                "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" },
              }}
            >
              Add
            </Button>
          </Box>
          {newLabel && (
            <Typography variant="caption" sx={{ color: "#bdbdbd", mt: 0.5, display: "block" }}>
              Value: <b>{toValue(newLabel)}</b>
            </Typography>
          )}
        </Box>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}
      >
        <Box sx={{ px: 3, pt: 3.5, pb: 3, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.5 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#fff3f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 26, color: "#e53935" }} />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3 }}>
              Delete Category
            </Typography>
            <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
              Are you sure you want to delete{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "#424242" }}>
                {deleteTarget?.label}
              </Box>
              ?
            </Typography>

            {productCount > 0 && (
              <Box sx={{ mt: 1.5, px: 2, py: 1.25, borderRadius: 2, backgroundColor: "#fff8e1", border: "1px solid #ffe082" }}>
                <Typography variant="body2" sx={{ color: "#f57f17", fontWeight: 600 }}>
                  ⚠️ {productCount} product{productCount > 1 ? "s are" : " is"} using this category.
                </Typography>
                <Typography variant="caption" sx={{ color: "#f9a825" }}>
                  Those products will have no category assigned.
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, width: "100%", mt: 0.5 }}>
            <Button
              fullWidth
              variant="outlined"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
              sx={{
                py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none",
                borderColor: "#e0e0e0", color: "#616161",
                "&:hover": { borderColor: "#bdbdbd", backgroundColor: "#f5f5f5" },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={deleting}
              onClick={confirmDelete}
              sx={{
                py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none",
                backgroundColor: "#e53935", boxShadow: "none",
                "&:hover": { backgroundColor: "#c62828", boxShadow: "none" },
                "&.Mui-disabled": { backgroundColor: "#ffcdd2", color: "#fff" },
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

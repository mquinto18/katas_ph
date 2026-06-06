"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useCategories } from "@/context/CategoriesContext";
import { supabase } from "@/lib/supabase";
import { type Category } from "@/lib/categoriesService";
import toast from "react-hot-toast";

const toValue = (label: string) =>
  label.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#2E7D32" } },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2E7D32" },
};

export default function ManageCategoriesSection() {
  const { categories, add, remove } = useCategories();

  const [newLabel, setNewLabel]   = useState("");
  const [addError, setAddError]   = useState("");
  const [adding, setAdding]       = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [deleting, setDeleting]         = useState(false);

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) { setAddError("Category name is required."); return; }
    const value = toValue(label);
    if (categories.some((c) => c.value === value)) { setAddError("Category already exists."); return; }
    setAdding(true);
    try {
      await add(label, value);
      toast.success(`"${label}" added!`);
      setNewLabel("");
      setAddError("");
    } catch {
      toast.error("Failed to add category.");
    } finally {
      setAdding(false);
    }
  };

  const openDelete = async (cat: Category) => {
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
      toast(`"${deleteTarget.label}" removed.`, { icon: " ", style: { background: "#e53935", color: "#fff" } });
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove category.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem", mb: 1.5 }}>
        Manage Categories
      </Typography>
      <Box sx={{ borderRadius: 3, border: "1px solid #f0f0f0", overflow: "hidden" }}>

        {/* List */}
        <Box sx={{ maxHeight: 280, overflowY: "auto", p: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {categories.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#bdbdbd", py: 1, px: 0.5 }}>No categories yet.</Typography>
          ) : (
            categories.map((cat) => (
              <Box
                key={cat.id}
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, borderRadius: 2, border: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>{cat.label}</Typography>
                  <Typography variant="caption" sx={{ color: "#bdbdbd" }}>{cat.value}</Typography>
                </Box>
                <Box
                  onClick={() => openDelete(cat)}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 1, cursor: "pointer", color: "#d0d0d0", transition: "color 0.15s", "&:hover": { color: "#e53935" } }}
                >
                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>
            ))
          )}
        </Box>

        <Divider />

        {/* Add form */}
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <TextField
              size="small"
              placeholder="Category name"
              value={newLabel}
              onChange={(e) => { setNewLabel(e.target.value); setAddError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              error={!!addError}
              helperText={addError}
              fullWidth
              sx={fieldSx}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={adding}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none", whiteSpace: "nowrap", backgroundColor: "#2E7D32", boxShadow: "none", py: 0.9, px: 2, "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" } }}
            >
              Add
            </Button>
          </Box>
          {newLabel && !addError && (
            <Typography variant="caption" sx={{ color: "#bdbdbd", mt: 0.5, display: "block" }}>
              Value: <b>{toValue(newLabel)}</b>
            </Typography>
          )}
        </Box>
      </Box>
    </Box>

    {/* Delete confirm dialog */}
    <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <Box sx={{ px: 3, pt: 3.5, pb: 3, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.5 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#fff3f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 26, color: "#e53935" }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3 }}>Delete Category</Typography>
          <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
            Are you sure you want to delete{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#424242" }}>{deleteTarget?.label}</Box>?
          </Typography>
          {productCount > 0 && (
            <Box sx={{ mt: 1.5, px: 2, py: 1.25, borderRadius: 2, backgroundColor: "#fff8e1", border: "1px solid #ffe082" }}>
              <Typography variant="body2" sx={{ color: "#f57f17", fontWeight: 600 }}>
                ⚠️ {productCount} product{productCount > 1 ? "s are" : " is"} using this category.
              </Typography>
              <Typography variant="caption" sx={{ color: "#f9a825" }}>Those products will have no category assigned.</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, width: "100%", mt: 0.5 }}>
          <Button fullWidth variant="outlined" disabled={deleting} onClick={() => setDeleteTarget(null)}
            sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none", borderColor: "#e0e0e0", color: "#616161", "&:hover": { borderColor: "#bdbdbd", backgroundColor: "#f5f5f5" } }}>
            Cancel
          </Button>
          <Button fullWidth variant="contained" disabled={deleting} onClick={confirmDelete}
            sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none", backgroundColor: "#e53935", boxShadow: "none", "&:hover": { backgroundColor: "#c62828", boxShadow: "none" }, "&.Mui-disabled": { backgroundColor: "#ffcdd2", color: "#fff" } }}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </Box>
      </Box>
    </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { type Product, type CategoryValue } from "./ProductCard";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import ManageCategoriesModal from "./ManageCategoriesModal";
import { useCategories } from "@/context/CategoriesContext";
import { fetchProducts, updateAvailability, deleteProduct, addProduct, editProduct } from "@/lib/productsService";
import toast from "react-hot-toast";

export default function InventoryLayout() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [addModalOpen, setAddModalOpen]   = useState(false);
  const [manageCatsOpen, setManageCatsOpen] = useState(false);
  const { categories, categoryMap } = useCategories();

  const CATEGORIES = [
    { label: "All Items", value: "all" },
    ...categories.map((c) => ({ label: c.label, value: c.value })),
  ];

  const [editTarget, setEditTarget]     = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [menuAnchor, setMenuAnchor]     = useState<null | HTMLElement>(null);
  const [menuProduct, setMenuProduct]   = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => toast.error("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async (id: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newValue = !product.available;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: newValue } : p)));
    try { await updateAvailability(id, newValue); }
    catch { toast.error("Failed to update availability."); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast(`"${deleteTarget.name}" deleted.`, { icon: " ", style: { background: "#e53935", color: "#fff" } });
    } catch { toast.error("Failed to delete product."); }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, product: Product) => {
    setMenuAnchor(e.currentTarget); setMenuProduct(product);
  };
  const closeMenu = () => { setMenuAnchor(null); setMenuProduct(null); };

  const handleEditProduct = async (updated: Product, imageFile?: File) => {
    try {
      const result = await editProduct(updated, imageFile);
      setProducts((prev) => prev.map((p) => p.id === updated.id ? result : p));
      toast.success("Product updated successfully!");
      setEditTarget(null);
    } catch { toast.error("Failed to update product."); }
  };

  const handleAddProduct = async (product: Omit<Product, "id">, imageFile?: File) => {
    try {
      const result = await addProduct(product, imageFile);
      setProducts((prev) => [...prev, result]);
      toast.success("Product added successfully!");
    } catch { toast.error("Failed to add product."); }
  };

  const ITEMS_PER_PAGE = 10;

  const filtered = products
    .filter((p) => activeCategory === "all" || p.category === (activeCategory as CategoryValue))
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const totalPages       = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated        = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalAvailable   = products.filter((p) => p.available).length;
  const totalUnavailable = products.filter((p) => !p.available).length;

  const StatusChip = ({ available }: { available: boolean }) => (
    <Chip
      icon={available
        ? <CheckCircleOutlinedIcon sx={{ fontSize: "13px !important" }} />
        : <CancelOutlinedIcon     sx={{ fontSize: "13px !important" }} />}
      label={available ? "Available" : "Unavailable"}
      size="small"
      sx={{
        height: 22, fontSize: "0.68rem", fontWeight: 600, borderRadius: 1,
        backgroundColor: available ? "#e8f5e9" : "#fce4ec",
        color: available ? "#2E7D32" : "#c62828",
        "& .MuiChip-icon": { color: available ? "#2E7D32" : "#c62828" },
      }}
    />
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, height: 0, minHeight: "100%", overflow: "hidden" }}>

      {/* ── Tab bar (horizontally scrollable on mobile) ── */}
      <Box sx={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        background: "transparent", px: { xs: 2, sm: 4 }, pt: 2, pb: 0,
        borderBottom: "2px solid #ffffff",
      }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: "6px", overflowX: "auto", flexShrink: 1, minWidth: 0, pb: "2px",
          "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <ButtonBase
                key={cat.value}
                onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                disableRipple
                sx={{
                  flexShrink: 0,
                  borderRadius: "10px 10px 0 0", px: { xs: 2, sm: 3 }, py: 1.1,
                  backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
                  borderTop:   isActive ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
                  borderLeft:  isActive ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
                  borderRight: isActive ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
                  mb: "-2px", zIndex: isActive ? 1 : 0, position: "relative", transition: "background-color 0.2s",
                  "&:hover": { backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.7)" },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? "#2E7D32" : "#555555", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                  {cat.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
        <Box sx={{
          flexShrink: 0,
          borderRadius: "10px 10px 0 0", px: 3, py: 1.1, backgroundColor: "#ffffff",
          borderTop: "1.5px solid rgba(0,0,0,0.08)", borderLeft: "1.5px solid rgba(0,0,0,0.08)",
          borderRight: "1.5px solid rgba(0,0,0,0.08)", mb: "-2px", position: "relative", zIndex: 1,
        }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            Inventory
          </Typography>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ flex: 1, backgroundColor: "#ffffff", overflowY: "auto", overflowX: "hidden", p: { xs: 2, sm: 3 } }}>

        {/* Stats + actions — stacks on mobile */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
          {/* Stat cards — 3-col grid on mobile so nothing overflows */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(3,1fr)", sm: "repeat(3,auto)" }, gap: { xs: 1, sm: 2 } }}>
            {[
              { label: "Total",       value: products.length,  color: "#212121", bg: "#f8f8f8", border: "#ebebeb" },
              { label: "Available",   value: totalAvailable,   color: "#2E7D32", bg: "#f0faf0", border: "#c8e6c9" },
              { label: "Unavailable", value: totalUnavailable, color: "#c62828", bg: "#fff5f5", border: "#ffcdd2" },
            ].map(({ label, value, color, bg, border }) => (
              <Box key={label} sx={{ minWidth: 0, px: { xs: 1.25, sm: 2.5 }, py: { xs: 1, sm: 1.5 }, borderRadius: 2, backgroundColor: bg, border: `1px solid ${border}` }}>
                <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 500, fontSize: { xs: "0.6rem", sm: "0.72rem" }, textTransform: "uppercase", letterSpacing: "0.04em", display: "block" }}>
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 800, color, lineHeight: 1.1, mt: 0.25, fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", ml: { xs: 0, sm: "auto" } }}>
            <TextField
              size="small"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#bdbdbd" }} /></InputAdornment> } }}
              sx={{
                width: { xs: "100%", sm: 220 },
                "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.875rem", "&.Mui-focused fieldset": { borderColor: "#2E7D32" } },
              }}
            />
            <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
              <Button variant="outlined" onClick={() => setManageCatsOpen(true)}
                sx={{ flex: { xs: 1, sm: "none" }, borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "0.875rem", borderColor: "#e0e0e0", color: "#616161", px: 2, py: 1.1, whiteSpace: "nowrap",
                  "&:hover": { borderColor: "#2E7D32", color: "#2E7D32", backgroundColor: "#f1f8f1" } }}>
                Categories
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddModalOpen(true)}
                sx={{ flex: { xs: 1, sm: "none" }, borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "0.875rem", backgroundColor: "#2E7D32", boxShadow: "none", px: 2.5, py: 1.1, whiteSpace: "nowrap",
                  "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" } }}>
                Add Product
              </Button>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={28} sx={{ color: "#2E7D32" }} />
          </Box>
        ) : (
          <>
            {/* ── Scrollable table wrapper ── */}
            <Box sx={{ width: "100%", overflowX: "auto", borderRadius: 2.5, border: "1px solid #f0f0f0" }}>
              <Box sx={{ minWidth: 600 }}>

                {/* Header */}
                <Box sx={{
                  display: "grid", gridTemplateColumns: "2.5fr 1.2fr 0.8fr 1fr 0.8fr 44px",
                  px: 2, py: 1.25, backgroundColor: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                }}>
                  {["Product", "Category", "Price", "Status", "Availability", ""].map((h, i) => (
                    <Typography key={i} variant="caption" sx={{ fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {/* Rows */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {paginated.map((product, index) => (
                    <Box key={product.id} sx={{
                      display: "grid", gridTemplateColumns: "2.5fr 1.2fr 0.8fr 1fr 0.8fr 44px",
                      alignItems: "center", px: 2, py: 1.25, backgroundColor: "#ffffff",
                      borderTop: index === 0 ? "none" : "1px solid #f5f5f5",
                      transition: "background-color 0.15s", "&:hover": { backgroundColor: "#fafafa" },
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ width: 38, height: 38, borderRadius: 1.5, backgroundColor: "#f5f5f5", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {product.image
                            ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <Typography sx={{ color: "#c0c0c0", fontWeight: 700, fontSize: "0.9rem" }}>{product.name.charAt(0).toUpperCase()}</Typography>}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.875rem" }}>{product.name}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#777", fontSize: "0.85rem" }}>{categoryMap[product.category] ?? product.category}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.875rem" }}>₱{product.price.toFixed(2)}</Typography>
                      <Box><StatusChip available={product.available} /></Box>
                      <Switch checked={product.available} onChange={() => toggleAvailability(product.id)} size="small"
                        sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#2E7D32" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#2E7D32" } }} />
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Box onClick={(e) => openMenu(e, product)} sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 1, cursor: "pointer", color: "#bdbdbd", transition: "color 0.15s", "&:hover": { color: "#424242" } }}>
                          <MoreVertIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

              </Box>
            </Box>

            {/* Pagination */}
            {filtered.length > ITEMS_PER_PAGE && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} items
                </Typography>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small"
                  sx={{ "& .MuiPaginationItem-root": { borderRadius: 1.5, fontWeight: 600, fontSize: "0.8rem" }, "& .MuiPaginationItem-root.Mui-selected": { backgroundColor: "#2E7D32", color: "#fff" }, "& .MuiPaginationItem-root.Mui-selected:hover": { backgroundColor: "#1b5e20" } }} />
              </Box>
            )}

            {filtered.length === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, gap: 1.5 }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 44, color: "#e8e8e8" }} />
                <Typography variant="body2" sx={{ color: "#c0c0c0", fontWeight: 500 }}>
                  {search ? `No results for "${search}"` : "No items in this category"}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ── Row actions menu ── */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}
        slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", minWidth: 150, border: "1px solid #f0f0f0" } } }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <MenuItem onClick={() => { setEditTarget(menuProduct); closeMenu(); }} sx={{ gap: 1.5, py: 1, fontSize: "0.875rem", fontWeight: 500, color: "#424242", borderRadius: 1, mx: 0.5 }}>
          <EditOutlinedIcon sx={{ fontSize: 16, color: "#9e9e9e" }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { setDeleteTarget(menuProduct); closeMenu(); }} sx={{ gap: 1.5, py: 1, fontSize: "0.875rem", fontWeight: 500, color: "#e53935", borderRadius: 1, mx: 0.5 }}>
          <DeleteOutlinedIcon sx={{ fontSize: 16, color: "#e53935" }} /> Delete
        </MenuItem>
      </Menu>

      <AddProductModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddProduct} />
      <ManageCategoriesModal open={manageCatsOpen} onClose={() => setManageCatsOpen(false)} />
      <EditProductModal key={editTarget?.id ?? "edit"} open={!!editTarget} product={editTarget} onClose={() => setEditTarget(null)} onEdit={handleEditProduct} />

      {/* ── Delete dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
        <Box sx={{ px: 3, pt: 3.5, pb: 3, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.5 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#fff3f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 26, color: "#e53935" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3 }}>Delete Product</Typography>
            <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
              Are you sure you want to delete{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "#424242" }}>{deleteTarget?.name}</Box>? This action cannot be undone.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, width: "100%", mt: 1 }}>
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
    </Box>
  );
}

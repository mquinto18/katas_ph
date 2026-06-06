"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import ButtonBase from "@mui/material/ButtonBase";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import ProductCard, { type Product, type CategoryValue } from "./ProductCard";
import CheckoutModal from "./CheckoutModal";
import { fetchProducts } from "@/lib/productsService";
import { useCategories } from "@/context/CategoriesContext";
import CircularProgress from "@mui/material/CircularProgress";


const ORDER_TYPES = [
  { value: "dine-in",  label: "Dine-In",  Icon: DinnerDiningIcon },
  { value: "takeout",  label: "Take Out",  Icon: ShoppingBagOutlinedIcon },
  { value: "delivery", label: "Delivery",  Icon: DeliveryDiningIcon },
];


interface OrderItem {
  product: Product;
  quantity: number;
}

export default function MainLayout() {
  const { categories } = useCategories();
  const CATEGORIES = [
    { label: "All Menus", value: "all" },
    ...categories.map((c) => ({ label: c.label, value: c.value })),
  ];
  const [activeCategory, setActiveCategory] = useState("all");
  const [orderType, setOrderType] = useState("dine-in");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter((p) => activeCategory === "all" || p.category === (activeCategory as CategoryValue))
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddToOrder = (product: Product, quantity: number) => {
    setOrderItems((prev) => {
      const existing = prev.findIndex((item) => item.product.id === product.id);
      if (existing !== -1) {
        return prev.map((item, i) =>
          i === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleChangeQty = (index: number, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item, i) => (i === index ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemove = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getItemSubtotal = (item: OrderItem) => item.product.price * item.quantity;

  const orderTotal = orderItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);

  const handleConfirmOrder = () => {
    setOrderItems([]);
    setCheckoutOpen(false);
  };

  return (
    <>
      {/* ── Mobile notice overlay ── */}
      <Box sx={{
        display: { xs: "flex", sm: "none" },
        position: "fixed", inset: 0, zIndex: 1100,
        flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(10px)",
        px: 4, textAlign: "center",
        gap: 2.5,
      }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: 3,
          backgroundColor: "#f0faf0",
          border: "1.5px solid #c8e6c9",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <DesktopWindowsOutlinedIcon sx={{ fontSize: 36, color: "#2E7D32" }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#1a1a1a", mb: 0.75, lineHeight: 1.3 }}>
            Best on a Larger Screen
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#757575", lineHeight: 1.6, maxWidth: 280, mx: "auto" }}>
            The Order page is designed for tablet or desktop use. Please switch to a larger screen for the best experience.
          </Typography>
        </Box>
        <Box sx={{
          px: 2.5, py: 1, borderRadius: 10,
          backgroundColor: "#f5f5f5",
          border: "1px solid #e0e0e0",
        }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#9e9e9e", fontWeight: 600 }}>
            Recommended: tablet or desktop
          </Typography>
        </Box>
      </Box>

    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, height: 0, minHeight: "100%" }}>

      {/* ── Shared full-width tab bar ── */}
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
        {/* Left: category tabs */}
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

        {/* Right: Order Summary tab */}
        <Box
          sx={{
            borderRadius: "10px 10px 0 0", px: 3, py: 1.1, backgroundColor: "#ffffff",
            borderTop: "1.5px solid rgba(0,0,0,0.08)", borderLeft: "1.5px solid rgba(0,0,0,0.08)",
            borderRight: "1.5px solid rgba(0,0,0,0.08)", mb: "-2px", position: "relative", zIndex: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            Order Summary
          </Typography>
        </Box>
      </Box>

      {/* ── Two-column content ── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left: product grid */}
        <Box sx={{ flex: 1, backgroundColor: "#ffffff", p: { xs: 2, sm: 3 }, overflow: "auto" }}>
          {/* Search + count row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#212121" }}>{filtered.length}</Typography>
              <Typography variant="body2" sx={{ color: "#9e9e9e", fontWeight: 500 }}>Products</Typography>
            </Box>
            <TextField
              size="small"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#bdbdbd" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: 220,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.875rem",
                  "&.Mui-focused fieldset": { borderColor: "#2E7D32" },
                },
              }}
            />
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={32} sx={{ color: "#2E7D32" }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, gap: 1.5 }}>
              <SearchIcon sx={{ fontSize: 44, color: "#e8e8e8" }} />
              <Typography variant="body2" sx={{ color: "#c0c0c0", fontWeight: 500 }}>
                {search ? `No results for "${search}"` : "No items in this category"}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(3,1fr)", md: "repeat(3,1fr)", lg: "repeat(5,1fr)" },
                gap: 2,
              }}
            >
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToOrder={handleAddToOrder}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Right: order panel — fixed, no scroll */}
        <Box
          sx={{
            width: { xs: "100%", md: 300, lg: 340 },
            flexShrink: 0,
            backgroundColor: "#ffffff",
            borderLeft: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Order type cards */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Typography variant="caption" sx={{ color: "#9e9e9e", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
                      flex: 1, flexDirection: "column", alignItems: "center", gap: 0.75,
                      py: 1.75, px: 1, borderRadius: 2.5,
                      border: isActive ? "2px solid #2E7D32" : "1.5px solid #e8e8e8",
                      backgroundColor: isActive ? "#f1f8f1" : "#fafafa",
                      transition: "all 0.18s",
                      "&:hover": { borderColor: "#2E7D32", backgroundColor: "#f1f8f1" },
                    }}
                  >
                    <Icon sx={{ fontSize: 26, color: isActive ? "#2E7D32" : "#9e9e9e", transition: "color 0.18s" }} />
                    <Typography variant="caption" sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? "#2E7D32" : "#757575", fontSize: "0.72rem", lineHeight: 1 }}>
                      {label}
                    </Typography>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>

          <Divider />

          {/* Order items list or empty state */}
          {orderItems.length === 0 ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 3, gap: 1 }}>
              <ShoppingBagOutlinedIcon sx={{ fontSize: 48, color: "#e0e0e0" }} />
              <Typography variant="body2" sx={{ color: "#bdbdbd", fontWeight: 500 }}>No items yet</Typography>
              <Typography variant="caption" sx={{ color: "#d0d0d0", textAlign: "center" }}>
                Add products from the menu to start an order
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
              {orderItems.map((item, index) => {
                const subtotal = getItemSubtotal(item);
                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid #f0f0f0",
                      backgroundColor: "#fafafa",
                      gap: 0.75,
                    }}
                  >
                    {/* Top row: image + name + remove */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          backgroundColor: "#f5f5f5",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Typography variant="caption" sx={{ color: "#bdbdbd", fontWeight: 700, fontSize: "0.85rem" }}>
                            {item.product.name.charAt(0).toUpperCase()}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#212121", fontSize: "0.8rem", lineHeight: 1.3 }} noWrap>
                          {item.product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#9e9e9e", fontSize: "0.7rem" }}>
                          ₱{item.product.price.toFixed(2)} each
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(index)}
                        sx={{ p: 0.25, color: "#e0e0e0", "&:hover": { color: "#e53935" }, flexShrink: 0 }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>


                    {/* Bottom row: qty controls + subtotal */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleChangeQty(index, -1)}
                          sx={{
                            width: 24, height: 24, border: "1.5px solid #e0e0e0", borderRadius: 1,
                            "&:hover": { borderColor: "#e53935", color: "#e53935" },
                          }}
                        >
                          <RemoveIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 16, textAlign: "center", fontSize: "0.85rem" }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleChangeQty(index, 1)}
                          sx={{
                            width: 24, height: 24, border: "1.5px solid #2E7D32", borderRadius: 1, color: "#2E7D32",
                            "&:hover": { backgroundColor: "#f1f8f1" },
                          }}
                        >
                          <AddIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "#2E7D32", fontSize: "0.85rem" }}>
                        ₱{subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Checkout button */}
          <Box sx={{ p: 2.5, borderTop: "1px solid #f0f0f0" }}>
            {orderItems.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: "#757575", fontWeight: 500 }}>Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#2E7D32", lineHeight: 1 }}>
                  ₱{orderTotal.toFixed(2)}
                </Typography>
              </Box>
            )}
            <Button
              fullWidth
              variant="contained"
              disabled={orderItems.length === 0}
              onClick={() => setCheckoutOpen(true)}
              startIcon={<ShoppingCartCheckoutIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                backgroundColor: "#2E7D32",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" },
                "&.Mui-disabled": {
                  backgroundColor: "#e0e0e0",
                  color: "#9e9e9e",
                },
              }}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>

    <CheckoutModal
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
      orderItems={orderItems}
      orderType={orderType}
      orderTotal={orderTotal}
      onConfirm={handleConfirmOrder}
    />
    </>
  );
}

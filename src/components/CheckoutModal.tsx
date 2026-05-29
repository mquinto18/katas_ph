"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CloseIcon from "@mui/icons-material/Close";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { type Product } from "./ProductCard";

interface OrderItem {
  product: Product;
  quantity: number;
  addons: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  orderType: string;
  orderTotal: number;
  onConfirm: (paymentMethod: string) => void;
}

const ADDON_PRICES: Record<string, number> = {
  "Extra Tapioca": 15, "Whipped Cream": 20,
  "Extra Rice": 25, "Extra Sauce": 10,
  "Extra Dip": 10, "Large Pack": 20,
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  "dine-in": "Dine-In",
  "takeout": "Take Out",
  "delivery": "Delivery",
};

export default function CheckoutModal({ open, onClose, orderItems, orderType, orderTotal, onConfirm }: Props) {
  const [payment, setPayment] = useState<"cash" | "online" | null>(null);
  const [cashAmount, setCashAmount] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  const cashValue = parseFloat(cashAmount) || 0;
  const change = cashValue - orderTotal;


  const getItemSubtotal = (item: OrderItem) => {
    const addonTotal = item.addons.reduce((sum, a) => sum + (ADDON_PRICES[a] ?? 0), 0);
    return (item.product.price + addonTotal) * item.quantity;
  };

  const handleConfirm = () => {
    if (!payment) return;
    setConfirmed(true);
  };

  const handleNextOrder = () => {
    onConfirm(payment!);
    setPayment(null);
    setCashAmount("");
    setConfirmed(false);
  };

  const handleClose = () => {
    setPayment(null);
    setCashAmount("");
    setConfirmed(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={confirmed ? "sm" : "md"}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "row",
            height: confirmed ? "auto" : 480,
          },
        },
      }}
    >
      {/* Success screen */}
      {confirmed ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Green header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #2E7D32, #43A047)",
              px: 4, py: 3,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 56, height: 56, borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                "@keyframes popIn": {
                  "0%":   { transform: "scale(0)", opacity: 0 },
                  "60%":  { transform: "scale(1.25)" },
                  "80%":  { transform: "scale(0.9)" },
                  "100%": { transform: "scale(1)", opacity: 1 },
                },
                animation: "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 36, color: "#fff" }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800, color: "#fff", lineHeight: 1.2,
                "@keyframes fadeUp": {
                  "0%":   { opacity: 0, transform: "translateY(10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
                animation: "fadeUp 0.4s ease 0.3s both",
              }}
            >
              Payment Successful!
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.75)",
                animation: "fadeUp 0.4s ease 0.45s both",
              }}
            >
              {payment === "cash" ? "Cash" : "Online Payment"} · {ORDER_TYPE_LABELS[orderType]}
            </Typography>
          </Box>

          {/* Body */}
          <Box
            sx={{
              flex: 1, px: 4, py: 3, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto",
              "@keyframes fadeUp": {
                "0%":   { opacity: 0, transform: "translateY(12px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
              animation: "fadeUp 0.4s ease 0.55s both",
            }}
          >

            {/* Total paid */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2.5, py: 2, borderRadius: 2.5, backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#616161" }}>Total Paid</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#2E7D32" }}>₱{orderTotal.toFixed(2)}</Typography>
            </Box>

            {/* Cash + Change display on success */}
            {payment === "cash" && cashValue > 0 && (
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Box sx={{ flex: 1, px: 2, py: 1.5, borderRadius: 2.5, border: "1px solid #f0f0f0", backgroundColor: "#f9f9f9", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#9e9e9e", display: "block" }}>Cash Received</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#212121" }}>₱{cashValue.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ flex: 1, px: 2, py: 1.5, borderRadius: 2.5, border: "1px solid #c8e6c9", backgroundColor: "#f1f8f1", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#9e9e9e", display: "block" }}>Change</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#2E7D32" }}>₱{change.toFixed(2)}</Typography>
                </Box>
              </Box>
            )}

          </Box>

          {/* Footer buttons */}
          <Box sx={{ px: 4, pb: 3, display: "flex", gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PrintOutlinedIcon />}
              onClick={handleClose}
              sx={{
                py: 1.3, borderRadius: 2.5, fontWeight: 700, fontSize: "0.9rem",
                textTransform: "none", borderColor: "#2E7D32", color: "#2E7D32",
                "&:hover": { backgroundColor: "#f1f8f1", borderColor: "#1b5e20" },
              }}
            >
              Print Receipt
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShoppingBagOutlinedIcon />}
              onClick={handleNextOrder}
              sx={{
                py: 1.3, borderRadius: 2.5, fontWeight: 700, fontSize: "0.9rem",
                textTransform: "none", backgroundColor: "#2E7D32", boxShadow: "none",
                "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" },
              }}
            >
              Next Order
            </Button>
          </Box>
        </Box>
      ) : (
      <>
      {/* Left: Order Summary */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid #f0f0f0" }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#212121", lineHeight: 1.2 }}>
              Order Summary
            </Typography>
            <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
              {ORDER_TYPE_LABELS[orderType]} · {orderItems.reduce((s, i) => s + i.quantity, 0)} item(s)
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#bdbdbd", "&:hover": { color: "#424242" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Items list */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          {orderItems.map((item, index) => (
            <Box key={index}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1 }}>
                <Box
                  sx={{
                    width: 38, height: 38, borderRadius: 1.5,
                    backgroundColor: "#f5f5f5",
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#bdbdbd", fontWeight: 700 }}>
                      {item.product.name.charAt(0).toUpperCase()}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#212121" }} noWrap>
                    {item.product.name}
                  </Typography>
                  {item.addons.length > 0 && (
                    <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
                      {item.addons.join(", ")}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#2E7D32" }}>
                    ₱{getItemSubtotal(item).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9e9e9e" }}>x{item.quantity}</Typography>
                </Box>
              </Box>
              {index < orderItems.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>

        {/* Total */}
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "transparent" }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#616161" }}>Total Amount</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#2E7D32" }}>
            ₱{orderTotal.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Right: Payment Method */}
      <Box sx={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", px: 3, py: 3, backgroundColor: "transparent" }}>
        <Typography variant="body1" sx={{ fontWeight: 800, color: "#212121", mb: 2 }}>
          Payment Method
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
          {[
            { key: "cash",   Icon: LocalAtmOutlinedIcon,    label: "Cash",           sub: "Pay at counter" },
            { key: "online", Icon: PhoneIphoneOutlinedIcon, label: "Online Payment", sub: "GCash / Maya / Card" },
          ].map(({ key, Icon, label, sub }) => {
            const isSelected = payment === key;
            return (
              <Box
                key={key}
                onClick={() => setPayment(key as "cash" | "online")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  py: 2,
                  border: isSelected ? "2px solid #2E7D32" : "1.5px solid #e8e8e8",
                  borderRadius: 3,
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#f1f8f1" : "#ffffff",
                  transition: "all 0.18s",
                  "&:hover": { borderColor: "#2E7D32", backgroundColor: "#f1f8f1" },
                }}
              >
                <Icon sx={{ fontSize: 28, color: isSelected ? "#2E7D32" : "#9e9e9e", flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: isSelected ? "#2E7D32" : "#212121" }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9e9e9e" }}>{sub}</Typography>
                </Box>
                {isSelected && <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#2E7D32", flexShrink: 0 }} />}
              </Box>
            );
          })}

          {/* Cash input + live change preview */}
          {payment === "cash" && (
            <>
              <TextField
                label="Cash Received"
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                size="small"
                fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start">₱</InputAdornment> } }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#2E7D32" } },
                  "& label.Mui-focused": { color: "#2E7D32" },
                }}
              />
              {cashValue > 0 && (
                <Box sx={{ px: 1.5, py: 1, borderRadius: 2, backgroundColor: change >= 0 ? "#f1f8f1" : "#fff3f3", border: `1.5px solid ${change >= 0 ? "#c8e6c9" : "#ffcdd2"}` }}>
                  <Typography variant="caption" sx={{ color: "#9e9e9e" }}>Change</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: change >= 0 ? "#2E7D32" : "#e53935" }}>
                    {change >= 0 ? `₱${change.toFixed(2)}` : "Insufficient amount"}
                  </Typography>
                </Box>
              )}
            </>
          )}

        </Box>

        <Button
          fullWidth
          variant="contained"
          disabled={!payment || (payment === "cash" && cashValue < orderTotal)}
          onClick={handleConfirm}
          sx={{
            mt: 2,
            py: 1.5,
            borderRadius: 2.5,
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "none",
            backgroundColor: "#2E7D32",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" },
            "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" },
          }}
        >
          Confirm Order
        </Button>
      </Box>
      </>
      )}
    </Dialog>
  );
}

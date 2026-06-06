"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useBusinessSettings } from "@/context/BusinessSettingsContext";
import toast from "react-hot-toast";

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#2E7D32" } },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2E7D32" },
};

export default function BusinessInfoSection() {
  const { settings, save, loading } = useBusinessSettings();

  const [shopName, setShopName]           = useState("");
  const [address, setAddress]             = useState("");
  const [phone, setPhone]                 = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [saving, setSaving]               = useState(false);

  useEffect(() => {
    if (!loading) {
      setShopName(settings.shop_name);
      setAddress(settings.address);
      setPhone(settings.phone);
      setReceiptFooter(settings.receipt_footer);
    }
  }, [loading, settings]);

  const handleSave = async () => {
    if (!shopName.trim()) { toast.error("Shop name is required."); return; }
    setSaving(true);
    try {
      await save({
        shop_name:      shopName.trim(),
        address:        address.trim(),
        phone:          phone.trim(),
        receipt_footer: receiptFooter.trim(),
      });
      toast.success("Business info saved!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem", mb: 1.5 }}>
        Business Information
      </Typography>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, border: "1px solid #f0f0f0" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} sx={{ color: "#2E7D32" }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <TextField
                size="small"
                label="Shop Name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                fullWidth
                slotProps={{ htmlInput: { maxLength: 100 } }}
                sx={fieldSx}
              />
              <TextField
                size="small"
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                slotProps={{ htmlInput: { maxLength: 30 } }}
                sx={fieldSx}
              />
            </Box>
            <TextField
              size="small"
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { maxLength: 200 } }}
              sx={fieldSx}
            />
            <TextField
              size="small"
              label="Receipt Footer Message"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { maxLength: 150 } }}
              sx={fieldSx}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={saving}
                onClick={handleSave}
                startIcon={saving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none", backgroundColor: "#2E7D32", boxShadow: "none", px: 3, py: 0.9, fontSize: "0.82rem", "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" } }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

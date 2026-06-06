"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { useEffect, useState } from "react";
import { usePrinter } from "@/context/PrinterContext";

export default function PrinterSection() {
  const { connected, connecting, connect, disconnect } = usePrinter();
  const [bluetoothSupported, setBluetoothSupported] = useState(false);

  useEffect(() => {
    setBluetoothSupported(!!navigator.bluetooth);
  }, []);

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem", mb: 1.5 }}>
        Printer
      </Typography>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              backgroundColor: connected ? "#2E7D32" : "#bdbdbd",
              boxShadow: connected ? "0 0 0 3px rgba(46,125,50,0.18)" : "none",
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
            <PrintOutlinedIcon sx={{ fontSize: 18, color: "#9e9e9e", flexShrink: 0 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>
                {connected ? "Printer Connected" : "No Printer Connected"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#bdbdbd" }}>
                {connected ? "Bluetooth thermal printer ready" : "Connect a Bluetooth thermal printer"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {connecting ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#9e9e9e" }}>
            <CircularProgress size={16} sx={{ color: "#2E7D32" }} />
            <Typography variant="caption" sx={{ color: "#9e9e9e" }}>Connecting…</Typography>
          </Box>
        ) : connected ? (
          <Button
            size="small"
            variant="outlined"
            onClick={disconnect}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "0.78rem", borderColor: "#e53935", color: "#e53935", "&:hover": { borderColor: "#c62828", backgroundColor: "#fff3f3" } }}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            onClick={connect}
            disabled={!bluetoothSupported}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "0.78rem", backgroundColor: "#2E7D32", boxShadow: "none", "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" } }}
          >
            {bluetoothSupported ? "Connect Printer" : "Not Supported"}
          </Button>
        )}
      </Box>
    </Box>
  );
}

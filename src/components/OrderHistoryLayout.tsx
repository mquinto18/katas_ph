"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { fetchOrders, type OrderRecord } from "@/lib/ordersService";

const ITEMS_PER_PAGE = 10;

const ORDER_TYPE_LABELS: Record<string, string> = {
  "dine-in":  "Dine-In",
  "takeout":  "Take Out",
  "delivery": "Delivery",
};

const ORDER_TYPE_ICONS: Record<string, React.ElementType> = {
  "dine-in":  DinnerDiningIcon,
  "takeout":  ShoppingBagOutlinedIcon,
  "delivery": DeliveryDiningIcon,
};

type DateFilter = "all" | "today" | "yesterday" | "month" | "custom";

const toLocalDateStr = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const getTodayStr = () => toLocalDateStr(new Date().toISOString());
const getYestStr  = () => { const d = new Date(); d.setDate(d.getDate() - 1); return toLocalDateStr(d.toISOString()); };

export default function OrderHistoryLayout() {
  const [orders, setOrders]           = useState<OrderRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [dateFilter, setDateFilter]   = useState<DateFilter>("all");
  const [customDate, setCustomDate]   = useState("");
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const dateInputRef  = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchOrders().then(setOrders).finally(() => setLoading(false)); }, []);

  const resetPage = () => setPage(1);

  const filtered = orders.filter((o) => {
    const orderDate = toLocalDateStr(o.created_at);
    if (dateFilter === "today")     return orderDate === getTodayStr();
    if (dateFilter === "yesterday") return orderDate === getYestStr();
    if (dateFilter === "custom" && customDate)    return orderDate === customDate;
    if (dateFilter === "month"  && selectedMonth) return orderDate.startsWith(selectedMonth);
    return true;
  });

  const totalPages    = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated     = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalRevenue  = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const filteredTotal = filtered.reduce((sum, o) => sum + Number(o.total), 0);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-GB"),
      time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const filterLabel =
    dateFilter === "today"     ? "Today" :
    dateFilter === "yesterday" ? "Yesterday" :
    dateFilter === "custom" && customDate    ? customDate :
    dateFilter === "month"  && selectedMonth ? new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }) :
    "Filter";

  const stats = dateFilter === "all"
    ? [{ label: "Total Orders", value: orders.length, color: "#212121", bg: "#f8f8f8", border: "#ebebeb" },
       { label: "Total Revenue", value: `₱${totalRevenue.toFixed(2)}`, color: "#2E7D32", bg: "#f0faf0", border: "#c8e6c9" }]
    : [{ label: "Orders",  value: filtered.length, color: "#212121", bg: "#f8f8f8", border: "#ebebeb" },
       { label: "Revenue", value: `₱${filteredTotal.toFixed(2)}`, color: "#2E7D32", bg: "#f0faf0", border: "#c8e6c9" }];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, height: 0, minHeight: "100%", overflow: "hidden" }}>

      {/* ── Tab bar ── */}
      <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-start", background: "transparent", px: { xs: 2, sm: 4 }, pt: 2, pb: 0, borderBottom: "2px solid #ffffff" }}>
        <Box sx={{ borderRadius: "10px 10px 0 0", px: 3, py: 1.1, backgroundColor: "#ffffff", borderTop: "1.5px solid rgba(0,0,0,0.08)", borderLeft: "1.5px solid rgba(0,0,0,0.08)", borderRight: "1.5px solid rgba(0,0,0,0.08)", mb: "-2px", position: "relative", zIndex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            Order History
          </Typography>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ flex: 1, backgroundColor: "#ffffff", overflowY: "auto", overflowX: "hidden", p: { xs: 2, sm: 3 } }}>

        {/* Stats + Filter row */}
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: { xs: 1, sm: 2 }, mb: 3 }}>
          {stats.map(({ label, value, color, bg, border }) => (
            <Box key={label} sx={{ px: { xs: 1.5, sm: 2.5 }, py: { xs: 1, sm: 1.5 }, borderRadius: 2, backgroundColor: bg, border: `1px solid ${border}`, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: "#9e9e9e", fontWeight: 500, fontSize: { xs: "0.62rem", sm: "0.75rem" }, whiteSpace: "nowrap" }}>{label}</Typography>
              <Typography sx={{ fontWeight: 800, color, lineHeight: 1.2, fontSize: { xs: "1rem", sm: "1.5rem" } }}>{value}</Typography>
            </Box>
          ))}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
            <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setFilterAnchor(e.currentTarget)}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: { xs: "0.8rem", sm: "0.875rem" },
                borderColor: dateFilter !== "all" ? "#2E7D32" : "#e0e0e0",
                color: dateFilter !== "all" ? "#2E7D32" : "#616161",
                backgroundColor: dateFilter !== "all" ? "#f1f8f1" : "#ffffff",
                px: { xs: 1.5, sm: 2.5 }, py: 1.1,
                "&:hover": { borderColor: "#2E7D32", color: "#2E7D32", backgroundColor: "#f1f8f1" } }}>
              {filterLabel}
            </Button>
            {dateFilter !== "all" && (
              <Box onClick={() => { setDateFilter("all"); setCustomDate(""); setSelectedMonth(""); resetPage(); }}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", backgroundColor: "#f5f5f5", color: "#9e9e9e", transition: "all 0.15s", "&:hover": { backgroundColor: "#ffebee", color: "#e53935" } }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </Box>
            )}
          </Box>
        </Box>

        {/* Filter popover */}
        <Popover open={!!filterAnchor} anchorEl={filterAnchor} onClose={() => setFilterAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { borderRadius: 2.5, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", border: "1px solid #f0f0f0", mt: 0.75, minWidth: 210 } } }}>
          <Box sx={{ p: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", px: 1, display: "block", mb: 0.5 }}>Quick Select</Typography>
            {(["all", "today", "yesterday"] as DateFilter[]).map((value) => {
              const label = value === "all" ? "All Time" : value === "today" ? "Today" : "Yesterday";
              const isActive = dateFilter === value;
              return (
                <ButtonBase key={value} disableRipple onClick={() => { setDateFilter(value); setCustomDate(""); setSelectedMonth(""); resetPage(); setFilterAnchor(null); }}
                  sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, borderRadius: 1.5, mb: 0.25, backgroundColor: isActive ? "#f1f8f1" : "transparent", color: isActive ? "#2E7D32" : "#424242", fontWeight: isActive ? 700 : 500, fontSize: "0.875rem", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                  {label}
                  {isActive && <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#2E7D32" }} />}
                </ButtonBase>
              );
            })}
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", px: 1, display: "block", mb: 1 }}>By Month</Typography>
            <Box onClick={() => monthInputRef.current?.showPicker()} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 1.5, py: 1, border: "1px solid #e8e8e8", borderRadius: 1.5, backgroundColor: "#fafafa", cursor: "pointer", mb: 1, "&:hover": { borderColor: "#2E7D32", backgroundColor: "#f1f8f1" } }}>
              <Typography variant="body2" sx={{ fontSize: "0.8rem", color: selectedMonth ? "#1a1a1a" : "#9e9e9e", fontWeight: selectedMonth ? 600 : 400 }}>
                {selectedMonth ? new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Select a month"}
              </Typography>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: selectedMonth ? "#2E7D32" : "#9e9e9e" }} />
              <input ref={monthInputRef} type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setDateFilter(e.target.value ? "month" : "all"); setCustomDate(""); resetPage(); if (e.target.value) setFilterAnchor(null); }} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }} />
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", px: 1, display: "block", mb: 1 }}>Pick a Date</Typography>
            <Box onClick={() => dateInputRef.current?.showPicker()} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 1.5, py: 1, border: "1px solid #e8e8e8", borderRadius: 1.5, backgroundColor: "#fafafa", cursor: "pointer", "&:hover": { borderColor: "#2E7D32", backgroundColor: "#f1f8f1" } }}>
              <Typography variant="body2" sx={{ fontSize: "0.8rem", color: customDate ? "#1a1a1a" : "#9e9e9e", fontWeight: customDate ? 600 : 400 }}>{customDate || "Select a date"}</Typography>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: customDate ? "#2E7D32" : "#9e9e9e" }} />
              <input ref={dateInputRef} type="date" value={customDate} onChange={(e) => { setCustomDate(e.target.value); setDateFilter(e.target.value ? "custom" : "all"); resetPage(); if (e.target.value) setFilterAnchor(null); }} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }} />
            </Box>
          </Box>
        </Popover>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={28} sx={{ color: "#2E7D32" }} />
          </Box>
        ) : (
          <>
            {/* ── Scrollable table wrapper ── */}
            <Box sx={{ width: "100%", overflowX: "auto", borderRadius: 2.5, border: "1px solid #f0f0f0" }}>
              <Box sx={{ minWidth: 560 }}>

                {/* Header */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 2.5fr 0.8fr 0.8fr", px: 2, py: 1.25, backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                  {["Date & Time", "Order Type", "Items", "Payment", "Total"].map((h) => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>{h}</Typography>
                  ))}
                </Box>

                {/* Rows */}
                <Box>
                  {paginated.map((order, index) => {
                    const { date, time } = formatDate(order.created_at);
                    const TypeIcon = ORDER_TYPE_ICONS[order.order_type] ?? DinnerDiningIcon;
                    return (
                      <Box key={order.id} sx={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 2.5fr 0.8fr 0.8fr", alignItems: "center", px: 2, py: 1.5, borderTop: index === 0 ? "none" : "1px solid #f5f5f5", backgroundColor: "#ffffff", transition: "background-color 0.15s", "&:hover": { backgroundColor: "#fafafa" } }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.82rem" }}>{date}</Typography>
                          <Typography variant="caption" sx={{ color: "#9e9e9e" }}>{time}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TypeIcon sx={{ fontSize: 15, color: "#9e9e9e" }} />
                          <Typography variant="body2" sx={{ color: "#616161", fontSize: "0.82rem" }}>{ORDER_TYPE_LABELS[order.order_type] ?? order.order_type}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {order.items.map((item, i) => (
                            <Chip key={i} label={`${item.quantity}× ${item.name}`} size="small" sx={{ height: 22, fontSize: "0.7rem", fontWeight: 500, backgroundColor: "#f5f5f5", color: "#424242", borderRadius: 1 }} />
                          ))}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          {order.payment === "cash" ? <LocalAtmOutlinedIcon sx={{ fontSize: 14, color: "#9e9e9e" }} /> : <PhoneIphoneOutlinedIcon sx={{ fontSize: 14, color: "#9e9e9e" }} />}
                          <Typography variant="body2" sx={{ color: "#616161", fontSize: "0.8rem" }}>{order.payment === "cash" ? "Cash" : "Online"}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.875rem" }}>₱{Number(order.total).toFixed(2)}</Typography>
                      </Box>
                    );
                  })}
                </Box>

              </Box>
            </Box>

            {/* Pagination */}
            {filtered.length > ITEMS_PER_PAGE && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} orders
                </Typography>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} size="small"
                  sx={{ "& .MuiPaginationItem-root": { borderRadius: 1.5, fontWeight: 600, fontSize: "0.8rem" }, "& .MuiPaginationItem-root.Mui-selected": { backgroundColor: "#2E7D32", color: "#fff" }, "& .MuiPaginationItem-root.Mui-selected:hover": { backgroundColor: "#1b5e20" } }} />
              </Box>
            )}

            {filtered.length === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, gap: 1.5 }}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: 44, color: "#e8e8e8" }} />
                <Typography variant="body2" sx={{ color: "#c0c0c0", fontWeight: 500 }}>
                  {dateFilter !== "all" ? "No orders for this date" : "No orders yet"}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

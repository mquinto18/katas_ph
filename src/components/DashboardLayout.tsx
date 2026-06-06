"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ButtonBase from "@mui/material/ButtonBase";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar, Cell as BarCell,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { fetchOrders, type OrderRecord } from "@/lib/ordersService";

type Period = "today" | "week" | "month" | "all";

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today",      value: "today" },
  { label: "This Week",  value: "week"  },
  { label: "This Month", value: "month" },
  { label: "All Time",   value: "all"   },
];

const PIE_COLORS   = ["#2E7D32", "#4CAF50", "#81C784", "#C8E6C9"];
const BAR_COLOR    = "#2E7D32";
const BAR_HOVER    = "#43a047";
const YELLOW       = "#FBC02D";
const YELLOW_LIGHT = "#FFF8E1";

const ORDER_TYPE_LABELS: Record<string, string> = {
  "dine-in":  "Dine-In",
  "takeout":  "Take Out",
  "delivery": "Delivery",
};

function toLocalDateStr(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getStartDate(period: Period): Date | null {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d;
  }
  if (period === "week") {
    const d = new Date(now); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d;
  }
  if (period === "month") {
    const d = new Date(now); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  }
  return null;
}

function formatK(v: number): string {
  if (v >= 1_000_000) return `₱${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000)    return `₱${(v / 1_000).toFixed(1)}k`;
  return `₱${v.toFixed(2)}`;
}

function EmptyChart() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <Typography sx={{ color: "#c8c8c8", fontSize: "0.8rem" }}>No data for this period</Typography>
    </Box>
  );
}

const tooltipStyle = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid #e8e8e8",
    fontSize: "0.78rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    padding: "8px 12px",
  },
};

export default function DashboardLayout() {
  const [orders, setOrders]         = useState<OrderRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [period, setPeriod]         = useState<Period>("all");
  const [hoveredPie, setHoveredPie] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const start = getStartDate(period);
    if (!start) return orders;
    return orders.filter((o) => new Date(o.created_at) >= start);
  }, [orders, period]);

  const totalRevenue = filtered.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders  = filtered.length;
  const avgOrder     = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const todayStr     = toLocalDateStr(new Date().toISOString());
  const todayRevenue = orders
    .filter((o) => toLocalDateStr(o.created_at) === todayStr)
    .reduce((sum, o) => sum + Number(o.total), 0);

  const bestSeller = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((o) => o.items.forEach((item) =>
      map.set(item.name, (map.get(item.name) ?? 0) + item.quantity)
    ));
    const top = Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0];
    return top ? { name: top[0], qty: top[1] } : null;
  }, [filtered]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((o) => map.set(o.order_type, (map.get(o.order_type) ?? 0) + Number(o.total)));
    return Array.from(map.entries())
      .map(([key, value]) => ({ name: ORDER_TYPE_LABELS[key] ?? key, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const barData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((o) => o.items.forEach((item) =>
      map.set(item.name, (map.get(item.name) ?? 0) + item.quantity * item.price)
    ));
    return Array.from(map.entries())
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);
  }, [filtered]);

  const areaData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((o) => {
      const d = toLocalDateStr(o.created_at);
      map.set(d, (map.get(d) ?? 0) + Number(o.total));
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date:    new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: Math.round(revenue * 100) / 100,
      }));
  }, [filtered]);

  const QUICK_STATS = [
    {
      label: "Today's Sales",
      value: formatK(todayRevenue),
      sub: `₱${todayRevenue.toFixed(2)}`,
      icon: TrendingUpOutlinedIcon,
      iconBg: "#f0faf0",
      iconColor: "#2E7D32",
      accent: undefined as string | undefined,
    },
    {
      label: "Total Orders",
      value: String(totalOrders),
      sub: `${period === "all" ? "all time" : `this ${period}`}`,
      icon: ReceiptLongOutlinedIcon,
      iconBg: "#e3f2fd",
      iconColor: "#1565C0",
      accent: undefined as string | undefined,
    },
    {
      label: "Best Seller",
      value: bestSeller ? bestSeller.name : "—",
      sub: bestSeller ? `${bestSeller.qty} sold` : "no data",
      icon: EmojiEventsOutlinedIcon,
      iconBg: "#fff8e1",
      iconColor: "#E65100",
      accent: undefined as string | undefined,
    },
    {
      label: "Avg. Order",
      value: formatK(avgOrder),
      sub: "per transaction",
      icon: LocalAtmOutlinedIcon,
      iconBg: "#f3e5f5",
      iconColor: "#6A1B9A",
      accent: undefined as string | undefined,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, height: 0, minHeight: "100%" }}>

      {/* ── Tab bar ── */}
      <Box sx={{
        display: "flex", alignItems: "flex-end", justifyContent: "flex-start",
        background: "transparent", px: { xs: 2, sm: 4 }, pt: 2, pb: 0,
        borderBottom: "2px solid #ffffff",
      }}>
        <Box sx={{
          borderRadius: "10px 10px 0 0", px: 3, py: 1.1, backgroundColor: "#ffffff",
          borderTop: "1.5px solid rgba(0,0,0,0.08)", borderLeft: "1.5px solid rgba(0,0,0,0.08)",
          borderRight: "1.5px solid rgba(0,0,0,0.08)", mb: "-2px", position: "relative", zIndex: 1,
        }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            Dashboard
          </Typography>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ flex: 1, backgroundColor: "#ffffff", overflow: "auto", overflowX: "hidden", p: { xs: 2, sm: 3 } }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={28} sx={{ color: "#2E7D32" }} />
          </Box>
        ) : (
          <>
            {/* ── Period filter + heading row ── */}
            <Box sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: { xs: 1.5, sm: 0 },
              mb: 2.5,
            }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: YELLOW, flexShrink: 0 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#1a1a1a", lineHeight: 1 }}>
                    Sales Overview
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "#9e9e9e", ml: "18px", display: "block" }}>
                  Overall platform sales generated
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                {PERIODS.map((p) => (
                  <ButtonBase
                    key={p.value}
                    disableRipple
                    onClick={() => setPeriod(p.value)}
                    sx={{
                      px: { xs: 1.5, sm: 2 }, py: 0.65, borderRadius: 2,
                      fontSize: { xs: "0.72rem", sm: "0.78rem" }, fontWeight: 600,
                      backgroundColor: period === p.value ? "#2E7D32" : "#f5f5f5",
                      color: period === p.value ? "#fff" : "#616161",
                      transition: "all 0.15s",
                      "&:hover": { backgroundColor: period === p.value ? "#1b5e20" : "#ebebeb" },
                    }}
                  >
                    {p.label}
                  </ButtonBase>
                ))}
              </Box>
            </Box>

            {/* ── Quick Stat Cards ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: { xs: 1.25, sm: 2 }, mb: 2.5 }}>
              {QUICK_STATS.map(({ label, value, sub, icon: Icon, iconBg, iconColor, accent }) => (
                <Box
                  key={label}
                  sx={{
                    minWidth: 0,            /* prevent grid blowout */
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    borderRadius: 2.5,
                    border: "1px solid #f0f0f0",
                    borderLeft: accent ? `3px solid ${accent}` : "1px solid #f0f0f0",
                    p: { xs: 1.25, sm: 2 },
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 1.75 },
                    cursor: "default",
                    transition: "all 0.18s",
                    "&:hover": {
                      boxShadow: accent ? `0 6px 24px ${accent}30` : "0 6px 24px rgba(0,0,0,0.08)",
                      transform: "translateY(-2px)",
                      borderColor: accent ?? "#e0e0e0",
                    },
                  }}
                >
                  <Box sx={{
                    width: { xs: 34, sm: 44 }, height: { xs: 34, sm: 44 },
                    borderRadius: 2, backgroundColor: iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon sx={{ fontSize: { xs: 17, sm: 22 }, color: iconColor }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, color: "#9e9e9e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: "#1a1a1a", fontSize: { xs: "0.82rem", sm: "1.05rem" }, lineHeight: 1.2, mt: 0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {value}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, color: "#b0b0b0", mt: 0.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* ── 3 Chart Cards ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.25fr 1.25fr" }, gap: { xs: 2, sm: 2.5 } }}>

              {/* Card 1: Sales Overview — donut with hover interaction */}
              <Box sx={{
                minWidth: 0,
                backgroundColor: "#fff", borderRadius: 3,
                border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                p: { xs: 2, sm: 2.5 },
                transition: "box-shadow 0.18s",
                "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "0.9rem" }}>Sales Overview</Typography>
                    <Typography variant="caption" sx={{ color: "#9e9e9e" }}>Revenue by order type</Typography>
                  </Box>
                  <Typography sx={{ color: "#d0d0d0", fontSize: "1.15rem", lineHeight: 1 }}>···</Typography>
                </Box>

                {pieData.length === 0 ? <Box sx={{ height: 180 }}><EmptyChart /></Box> : (
                  <>
                    <Box sx={{ position: "relative", height: { xs: 200, sm: 176 } }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={74}
                            paddingAngle={2} dataKey="value" strokeWidth={0}
                            onMouseLeave={() => setHoveredPie(null)}
                          >
                            {pieData.map((_, i) => (
                              <Cell
                                key={i}
                                fill={PIE_COLORS[i % PIE_COLORS.length]}
                                opacity={hoveredPie === null || hoveredPie === i ? 1 : 0.45}
                                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                                onMouseEnter={() => setHoveredPie(i)}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            {...tooltipStyle}
                            formatter={(v) => [`₱${Number(v).toFixed(2)}`, "Revenue"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center label */}
                      <Box sx={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center", pointerEvents: "none",
                      }}>
                        <Typography sx={{ fontWeight: 900, fontSize: "0.9rem", color: "#1a1a1a", lineHeight: 1 }}>
                          {hoveredPie !== null && pieData[hoveredPie]
                            ? formatK(pieData[hoveredPie].value)
                            : formatK(totalRevenue)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6rem", color: "#9e9e9e", mt: 0.3 }}>
                          {hoveredPie !== null && pieData[hoveredPie] ? pieData[hoveredPie].name : "Total"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Legend rows */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 0.5 }}>
                      {pieData.map((item, i) => (
                        <Box
                          key={item.name}
                          onMouseEnter={() => setHoveredPie(i)}
                          onMouseLeave={() => setHoveredPie(null)}
                          sx={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            px: 1, py: 0.5, borderRadius: 1.5, cursor: "default",
                            backgroundColor: hoveredPie === i ? "#f5f5f5" : "transparent",
                            transition: "background-color 0.15s",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ color: "#616161", fontWeight: 500 }}>{item.name}</Typography>
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                            ₱{item.value.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </Box>

              {/* Card 2: Top Products — bar chart with hover highlight */}
              <Box sx={{
                minWidth: 0,
                backgroundColor: "#fff", borderRadius: 3,
                border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                p: { xs: 2, sm: 2.5 },
                transition: "box-shadow 0.18s",
                "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "0.9rem" }}>Top Products</Typography>
                    <Typography variant="caption" sx={{ color: "#9e9e9e" }}>Revenue per product</Typography>
                  </Box>
                  <Typography sx={{ color: "#d0d0d0", fontSize: "1.15rem", lineHeight: 1 }}>···</Typography>
                </Box>

                <Box sx={{ height: { xs: 220, sm: 260 } }}>
                  {barData.length === 0 ? <EmptyChart /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{ top: 4, right: 4, left: -10, bottom: 44 }}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 9, fill: "#9e9e9e" }}
                          axisLine={false} tickLine={false}
                          interval={0} angle={-38} textAnchor="end"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#9e9e9e" }}
                          axisLine={false} tickLine={false}
                          tickFormatter={(v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`}
                          width={44}
                        />
                        <Tooltip
                          {...tooltipStyle}
                          cursor={{ fill: "rgba(46,125,50,0.06)" }}
                          formatter={(v) => [`₱${Number(v).toFixed(2)}`, "Revenue"]}
                        />
                        <Bar
                          dataKey="revenue"
                          radius={[5, 5, 0, 0]}
                          onMouseEnter={(_, index) => setHoveredBar(index)}
                        >
                          {barData.map((_, index) => (
                            <BarCell
                              key={index}
                              fill={
                                index === 0
                                  ? hoveredBar === 0 ? "#F9A825" : YELLOW
                                  : hoveredBar === index ? BAR_HOVER : BAR_COLOR
                              }
                              style={{ transition: "fill 0.15s", cursor: "pointer" }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Box>

              {/* Card 3: Sales Trend — area chart */}
              <Box sx={{
                minWidth: 0,
                backgroundColor: "#fff", borderRadius: 3,
                border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                p: { xs: 2, sm: 2.5 },
                transition: "box-shadow 0.18s",
                "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "0.9rem" }}>Sales Trend</Typography>
                    <Typography variant="caption" sx={{ color: "#9e9e9e" }}>Daily revenue over time</Typography>
                  </Box>
                  <Typography sx={{ color: "#d0d0d0", fontSize: "1.15rem", lineHeight: 1 }}>···</Typography>
                </Box>

                <Box sx={{ height: { xs: 220, sm: 260 } }}>
                  {areaData.length === 0 ? <EmptyChart /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -10, bottom: 4 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#2E7D32" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#9e9e9e" }}
                          axisLine={false} tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#9e9e9e" }}
                          axisLine={false} tickLine={false}
                          tickFormatter={(v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`}
                          width={44}
                        />
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(v) => [`₱${Number(v).toFixed(2)}`, "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2E7D32"
                          strokeWidth={2.5}
                          fill="url(#areaGrad)"
                          dot={false}
                          activeDot={{ r: 5, fill: "#2E7D32", strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

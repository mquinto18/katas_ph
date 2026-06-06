"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import PrinterSection from "@/components/settings/PrinterSection";
import ChangePasswordSection from "@/components/settings/ChangePasswordSection";

// ── Validation ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

interface FieldErrors {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

function validateForm(fullName: string, email: string, password: string, role: string): FieldErrors {
  return {
    fullName: !fullName.trim() ? "Full name is required." : fullName.trim().length > 100 ? "Name is too long." : "",
    email:    !email.trim() ? "Email is required." : !EMAIL_RE.test(email.trim()) ? "Enter a valid email." : email.length > 254 ? "Email is too long." : "",
    password: !password ? "Password is required." : password.length < 6 ? "Minimum 6 characters." : password.length > 72 ? "Password is too long." : "",
    role:     !role ? "Select a role." : "",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDisplayName(u: User): string {
  return u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split("@")[0] ?? "—";
}

function getRole(u: User): string {
  return u.user_metadata?.role ?? "admin";
}

function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const rest = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  admin: { bg: "#f0faf0", color: "#2E7D32", border: "#c8e6c9" },
  staff: { bg: "#e8f4fd", color: "#1565c0", border: "#bbdefb" },
};

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#2E7D32" } },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2E7D32" },
};

// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers]             = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Add-user form
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [role, setRole]           = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState<FieldErrors>({ fullName: "", email: "", password: "", role: "" });
  const [touched, setTouched]     = useState({ fullName: false, email: false, password: false, role: false });

  // Edit name
  const [editingName, setEditingName]   = useState(false);
  const [nameValue, setNameValue]       = useState("");
  const [savingName, setSavingName]     = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Load data ─────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // ── Add user ──────────────────────────────────────────────────────────────

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateForm(fullName, email, password, role)[field] }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, role: true });
    const errs = validateForm(fullName, email, password, role);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${fullName.trim()} added successfully!`);
      setFullName(""); setEmail(""); setPassword(""); setRole("");
      setTouched({ fullName: false, email: false, password: false, role: false });
      setErrors({ fullName: "", email: "", password: "", role: "" });
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add user.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete user ───────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users?id=${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(`"${getDisplayName(deleteTarget)}" removed.`, { icon: " ", style: { background: "#e53935", color: "#fff" } });
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: trimmed, name: trimmed } });
      if (error) throw error;
      setCurrentUser(data.user);
      setEditingName(false);
      toast.success("Name updated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const roleColors = currentUser ? (ROLE_COLORS[getRole(currentUser)] ?? ROLE_COLORS.admin) : ROLE_COLORS.admin;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, height: 0, minHeight: "100%", overflow: "hidden" }}>

      {/* Tab bar */}
      <Box sx={{ display: "flex", alignItems: "flex-end", background: "transparent", px: { xs: 2, sm: 4 }, pt: 2, pb: 0, borderBottom: "2px solid #ffffff" }}>
        <Box sx={{ flexShrink: 0, borderRadius: "10px 10px 0 0", px: 3, py: 1.1, backgroundColor: "#ffffff", borderTop: "1.5px solid rgba(0,0,0,0.08)", borderLeft: "1.5px solid rgba(0,0,0,0.08)", borderRight: "1.5px solid rgba(0,0,0,0.08)", mb: "-2px", position: "relative", zIndex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E7D32", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            Settings
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, backgroundColor: "#ffffff", overflowY: "auto", overflowX: "hidden", p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1px 1.6fr" }, gap: { xs: 3, lg: "0 28px" }, alignItems: "start" }}>

          {/* ── Left column ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* My Profile */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem", mb: 1.5 }}>
                My Profile
              </Typography>
              <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: "#2E7D32", width: 56, height: 56, fontSize: "1.25rem", fontWeight: 700, flexShrink: 0 }}>
                    {currentUser ? getInitials(getDisplayName(currentUser)) : "?"}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {editingName ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <TextField
                          size="small"
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                          autoFocus
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: "0.9rem", "&.Mui-focused fieldset": { borderColor: "#2E7D32" } } }}
                        />
                        <IconButton size="small" onClick={handleSaveName} disabled={savingName} sx={{ color: "#2E7D32", "&:hover": { backgroundColor: "#f0faf0" } }}>
                          {savingName ? <CircularProgress size={14} sx={{ color: "#2E7D32" }} /> : <CheckIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                        <IconButton size="small" onClick={() => setEditingName(false)} sx={{ color: "#bdbdbd", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#1a1a1a" }}>
                          {currentUser ? getDisplayName(currentUser) : "—"}
                        </Typography>
                        {currentUser && (
                          <Chip
                            label={getRole(currentUser).charAt(0).toUpperCase() + getRole(currentUser).slice(1)}
                            size="small"
                            sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1, backgroundColor: roleColors.bg, color: roleColors.color, border: `1px solid ${roleColors.border}` }}
                          />
                        )}
                        <Tooltip title="Edit name" arrow>
                          <IconButton
                            size="small"
                            onClick={() => { setNameValue(currentUser ? getDisplayName(currentUser) : ""); setEditingName(true); }}
                            sx={{ color: "#bdbdbd", p: 0.4, "&:hover": { color: "#2E7D32", backgroundColor: "#f0faf0" } }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.3, fontSize: "0.82rem" }}>
                      {currentUser?.email ?? "—"}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="caption" sx={{ color: "#bdbdbd" }}>
                  {currentUser ? `Member since ${formatDate(currentUser.created_at)}` : ""}
                </Typography>
              </Box>
            </Box>

            {/* Printer */}
            <PrinterSection />

            {/* Change Password */}
            <ChangePasswordSection />

          </Box>

          {/* ── Vertical divider ── */}
          <Box sx={{ display: { xs: "none", lg: "block" }, backgroundColor: "#f0f0f0", alignSelf: "stretch" }} />

          {/* ── Right column ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* Add New User */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem", mb: 1.5 }}>
                Add New User
              </Typography>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, border: "1px solid #f0f0f0" }}>
                <Box component="form" onSubmit={handleAddUser} noValidate sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                    <TextField
                      size="small"
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); if (touched.fullName) setErrors((er) => ({ ...er, fullName: validateForm(e.target.value, email, password, role).fullName })); }}
                      onBlur={() => handleBlur("fullName")}
                      error={touched.fullName && !!errors.fullName}
                      helperText={touched.fullName ? errors.fullName : ""}
                      fullWidth
                      slotProps={{
                        htmlInput: { maxLength: 100 },
                        input: { startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ fontSize: 16, color: "#bdbdbd" }} /></InputAdornment> },
                      }}
                      sx={fieldSx}
                    />
                    <TextField
                      size="small"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (touched.email) setErrors((er) => ({ ...er, email: validateForm(fullName, e.target.value, password, role).email })); }}
                      onBlur={() => handleBlur("email")}
                      error={touched.email && !!errors.email}
                      helperText={touched.email ? errors.email : ""}
                      fullWidth
                      slotProps={{
                        htmlInput: { maxLength: 254 },
                        input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 16, color: "#bdbdbd" }} /></InputAdornment> },
                      }}
                      sx={fieldSx}
                    />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <TextField
                        size="small"
                        label="Password"
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (touched.password) setErrors((er) => ({ ...er, password: validateForm(fullName, email, e.target.value, role).password })); }}
                        onBlur={() => handleBlur("password")}
                        error={touched.password && !!errors.password}
                        helperText={touched.password ? errors.password : ""}
                        fullWidth
                        slotProps={{
                          htmlInput: { maxLength: 72 },
                          input: {
                            startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 16, color: "#bdbdbd" }} /></InputAdornment>,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setShowPass((p) => !p)} edge="end">
                                  {showPass ? <VisibilityOff sx={{ fontSize: 16, color: "#bdbdbd" }} /> : <Visibility sx={{ fontSize: 16, color: "#bdbdbd" }} />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={fieldSx}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small" variant="text"
                          startIcon={<AutorenewIcon sx={{ fontSize: 14 }} />}
                          onClick={() => { const p = generatePassword(); setPassword(p); setShowPass(true); if (touched.password) setErrors((er) => ({ ...er, password: validateForm(fullName, email, p, role).password })); }}
                          sx={{ textTransform: "none", fontSize: "0.72rem", color: "#2E7D32", fontWeight: 600, p: 0, minWidth: 0, "&:hover": { background: "none", textDecoration: "underline" } }}
                        >Generate</Button>
                        {password && (
                          <Button
                            size="small" variant="text"
                            startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                            onClick={() => { navigator.clipboard.writeText(password); toast.success("Password copied!"); }}
                            sx={{ textTransform: "none", fontSize: "0.72rem", color: "#757575", fontWeight: 600, p: 0, minWidth: 0, "&:hover": { background: "none", textDecoration: "underline" } }}
                          >Copy</Button>
                        )}
                      </Box>
                    </Box>
                    <FormControl size="small" fullWidth error={touched.role && !!errors.role} sx={fieldSx}>
                      <InputLabel sx={{ "&.Mui-focused": { color: "#2E7D32" } }}>Role</InputLabel>
                      <Select
                        value={role}
                        label="Role"
                        onChange={(e) => { setRole(e.target.value); if (touched.role) setErrors((er) => ({ ...er, role: validateForm(fullName, email, password, e.target.value).role })); }}
                        onBlur={() => handleBlur("role")}
                        sx={{ borderRadius: 2, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2E7D32" } }}
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="staff">Staff</MenuItem>
                      </Select>
                      {touched.role && errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                    </FormControl>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="submit" variant="contained"
                      startIcon={submitting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <AddIcon />}
                      disabled={submitting}
                      sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none", backgroundColor: "#2E7D32", boxShadow: "none", px: 3, py: 1.1, "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" } }}
                    >
                      {submitting ? "Adding…" : "Add User"}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* All Users */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem", mb: 1.5 }}>
                All Users
              </Typography>
              {loadingUsers ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress size={28} sx={{ color: "#2E7D32" }} />
                </Box>
              ) : (
                <Box sx={{ borderRadius: 3, border: "1px solid #f0f0f0", overflow: "hidden" }}>
                  <Box sx={{ display: { xs: "none", sm: "grid" }, gridTemplateColumns: "2fr 2fr 0.8fr 1fr 44px", px: 2, py: 1.25, backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                    {["Name", "Email", "Role", "Joined", ""].map((h, i) => (
                      <Typography key={i} variant="caption" sx={{ fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>{h}</Typography>
                    ))}
                  </Box>
                  {users.length === 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 1 }}>
                      <PeopleOutlinedIcon sx={{ fontSize: 40, color: "#e8e8e8" }} />
                      <Typography variant="body2" sx={{ color: "#c0c0c0", fontWeight: 500 }}>No users found</Typography>
                    </Box>
                  ) : (
                    users.map((u, index) => {
                      const name   = getDisplayName(u);
                      const role   = getRole(u);
                      const colors = ROLE_COLORS[role] ?? ROLE_COLORS.admin;
                      const isMe   = u.id === currentUser?.id;
                      return (
                        <Box key={u.id}>
                          {index > 0 && <Divider />}
                          {/* Desktop row */}
                          <Box sx={{ display: { xs: "none", sm: "grid" }, gridTemplateColumns: "2fr 2fr 0.8fr 1fr 44px", alignItems: "center", px: 2, py: 1.5, "&:hover": { backgroundColor: "#fafafa" }, transition: "background-color 0.15s" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: "#2E7D32", width: 32, height: 32, fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                                {getInitials(name)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.875rem" }} noWrap>{name}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: "#777", fontSize: "0.85rem" }} noWrap>{u.email}</Typography>
                            <Chip label={role.charAt(0).toUpperCase() + role.slice(1)} size="small" sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1, backgroundColor: colors.bg, color: colors.color, border: `1px solid ${colors.border}`, width: "fit-content" }} />
                            <Typography variant="caption" sx={{ color: "#9e9e9e" }}>{formatDate(u.created_at)}</Typography>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                              {isMe ? (
                                <Tooltip title="Cannot delete your own account" arrow>
                                  <Box sx={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <DeleteOutlinedIcon sx={{ fontSize: 16, color: "#e0e0e0" }} />
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Box onClick={() => setDeleteTarget(u)} sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 1, cursor: "pointer", color: "#bdbdbd", transition: "color 0.15s", "&:hover": { color: "#e53935" } }}>
                                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                                </Box>
                              )}
                            </Box>
                          </Box>
                          {/* Mobile card */}
                          <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 1.5, px: 2, py: 1.5 }}>
                            <Avatar sx={{ bgcolor: "#2E7D32", width: 38, height: 38, fontSize: "0.85rem", fontWeight: 700, flexShrink: 0 }}>
                              {getInitials(name)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.875rem" }} noWrap>{name}</Typography>
                              <Typography variant="caption" sx={{ color: "#9e9e9e" }} noWrap>{u.email}</Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <Chip label={role.charAt(0).toUpperCase() + role.slice(1)} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1, backgroundColor: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }} />
                              </Box>
                            </Box>
                            {!isMe && (
                              <Box onClick={() => setDeleteTarget(u)} sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 1, cursor: "pointer", color: "#bdbdbd", flexShrink: 0, "&:hover": { color: "#e53935" } }}>
                                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
              )}
            </Box>

          </Box>{/* end right column */}

        </Box>{/* end main grid */}
      </Box>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <Box sx={{ px: 3, pt: 3.5, pb: 3, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.5 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#fff3f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 26, color: "#e53935" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", lineHeight: 1.3 }}>Remove User</Typography>
            <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
              Are you sure you want to remove{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "#424242" }}>{deleteTarget ? getDisplayName(deleteTarget) : ""}</Box>?
              They will no longer be able to sign in.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, width: "100%", mt: 1 }}>
            <Button fullWidth variant="outlined" disabled={deleting} onClick={() => setDeleteTarget(null)}
              sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none", borderColor: "#e0e0e0", color: "#616161", "&:hover": { borderColor: "#bdbdbd", backgroundColor: "#f5f5f5" } }}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" disabled={deleting} onClick={handleDelete}
              sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none", backgroundColor: "#e53935", boxShadow: "none", "&:hover": { backgroundColor: "#c62828", boxShadow: "none" }, "&.Mui-disabled": { backgroundColor: "#ffcdd2", color: "#fff" } }}>
              {deleting ? "Removing…" : "Remove"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#2E7D32" } },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2E7D32" },
};

interface Errors { newPassword: string; confirmPassword: string; }
interface Touched { newPassword: boolean; confirmPassword: boolean; }

function validate(newPassword: string, confirmPassword: string): Errors {
  return {
    newPassword:
      !newPassword ? "New password is required." :
      newPassword.length < 6 ? "Minimum 6 characters." :
      newPassword.length > 72 ? "Maximum 72 characters." : "",
    confirmPassword:
      !confirmPassword ? "Please confirm your password." :
      confirmPassword !== newPassword ? "Passwords do not match." : "",
  };
}

export default function ChangePasswordSection() {
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [errors, setErrors]   = useState<Errors>({ newPassword: "", confirmPassword: "" });
  const [touched, setTouched] = useState<Touched>({ newPassword: false, confirmPassword: false });

  const handleBlur = (field: keyof Touched) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(newPassword, confirmPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ newPassword: true, confirmPassword: true });
    const errs = validate(newPassword, confirmPassword);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTouched({ newPassword: false, confirmPassword: false });
      setErrors({ newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem", mb: 1.5 }}>
        Change Password
      </Typography>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, border: "1px solid #f0f0f0" }}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextField
            size="small"
            label="New Password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); if (touched.newPassword) setErrors(validate(e.target.value, confirmPassword)); }}
            onBlur={() => handleBlur("newPassword")}
            error={touched.newPassword && !!errors.newPassword}
            helperText={touched.newPassword ? errors.newPassword : ""}
            fullWidth
            slotProps={{
              htmlInput: { maxLength: 72 },
              input: {
                startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 16, color: "#bdbdbd" }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew((p) => !p)} edge="end">
                      {showNew ? <VisibilityOff sx={{ fontSize: 16, color: "#bdbdbd" }} /> : <Visibility sx={{ fontSize: 16, color: "#bdbdbd" }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />
          <TextField
            size="small"
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if (touched.confirmPassword) setErrors(validate(newPassword, e.target.value)); }}
            onBlur={() => handleBlur("confirmPassword")}
            error={touched.confirmPassword && !!errors.confirmPassword}
            helperText={touched.confirmPassword ? errors.confirmPassword : ""}
            fullWidth
            slotProps={{
              htmlInput: { maxLength: 72 },
              input: {
                startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 16, color: "#bdbdbd" }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm((p) => !p)} edge="end">
                      {showConfirm ? <VisibilityOff sx={{ fontSize: 16, color: "#bdbdbd" }} /> : <Visibility sx={{ fontSize: 16, color: "#bdbdbd" }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none", backgroundColor: "#2E7D32", boxShadow: "none", px: 3, py: 0.9, fontSize: "0.82rem", "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" } }}
            >
              {submitting ? "Updating…" : "Update Password"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { supabase } from "@/lib/supabase";

// ── Validation ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function sanitizeEmail(raw: string): string {
  // Trim whitespace and strip null bytes
  return raw.trim().replace(/\0/g, "");
}

function sanitizePassword(raw: string): string {
  // Strip null bytes only — do NOT trim (spaces in passwords are valid)
  return raw.replace(/\0/g, "");
}

function validateEmail(value: string): string {
  if (!value.trim())              return "Email is required.";
  if (value.trim().length > 254)  return "Email address is too long.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return "";
}

function validatePassword(value: string): string {
  if (!value)          return "Password is required.";
  if (value.length < 6)  return "Password must be at least 6 characters.";
  if (value.length > 72) return "Password is too long.";
  return "";
}

// ── Max failed attempts before a short client-side cooldown ──────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 30_000; // 30 seconds

// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]      = useState(false);
  const [loading, setLoading]        = useState(false);

  const [emailError, setEmailError]       = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError]         = useState("");

  // Touched flags: only show field errors after the user has left the field
  const [emailTouched, setEmailTouched]       = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Brute-force cooldown
  const [attempts, setAttempts]     = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const remainingLockout = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  const isLocked = remainingLockout > 0;

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    // Mark both fields as touched so errors are visible
    setEmailTouched(true);
    setPasswordTouched(true);

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    if (isLocked) return;

    setLoading(true);
    setFormError("");

    const cleanEmail    = sanitizeEmail(email);
    const cleanPassword = sanitizePassword(password);

    const { error } = await supabase.auth.signInWithPassword({
      email:    cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setAttempts(0);
        setFormError(`Too many failed attempts. Try again in 30 seconds.`);
      } else {
        setFormError("Invalid email or password.");
      }
      setLoading(false);
    } else {
      router.push("/orders");
      router.refresh();
    }
  };

  // ── Field sx shorthand ───────────────────────────────────────────────────

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      "&.Mui-focused fieldset": { borderColor: "#2E7D32" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#2E7D32" },
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
      <Box sx={{
        width: "100%", maxWidth: 400,
        backgroundColor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        p: { xs: 3, sm: 4 },
      }}>

        {/* Brand */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
          <Image src="/logo.png" alt="Katas PH" width={64} height={64} priority />
          <Typography sx={{ fontWeight: 800, color: "#2E7D32", fontSize: "1.4rem", letterSpacing: "0.02em", mt: 1.5, lineHeight: 1 }}>
            Katas PH
          </Typography>
          <Typography variant="caption" sx={{ color: "#FBC02D", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            POS System
          </Typography>
        </Box>

        {/* Heading */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#1a1a1a", lineHeight: 1.2 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: "#9e9e9e", mt: 0.5 }}>
            Sign in to your account to continue
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailTouched) setEmailError(validateEmail(e.target.value));
            }}
            onBlur={handleEmailBlur}
            error={emailTouched && !!emailError}
            helperText={emailTouched ? emailError : ""}
            required
            fullWidth
            autoComplete="email"
            slotProps={{
              htmlInput: { maxLength: 254 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ fontSize: 18, color: "#bdbdbd" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />

          <TextField
            label="Password"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordTouched) setPasswordError(validatePassword(e.target.value));
            }}
            onBlur={handlePasswordBlur}
            error={passwordTouched && !!passwordError}
            helperText={passwordTouched ? passwordError : ""}
            required
            fullWidth
            autoComplete="current-password"
            slotProps={{
              htmlInput: { maxLength: 72 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 18, color: "#bdbdbd" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass((p) => !p)} edge="end">
                      {showPass
                        ? <VisibilityOff sx={{ fontSize: 18, color: "#bdbdbd" }} />
                        : <Visibility   sx={{ fontSize: 18, color: "#bdbdbd" }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />

          {/* Form-level error */}
          {formError && (
            <Box sx={{ px: 1.5, py: 1, borderRadius: 1.5, backgroundColor: "#fff5f5", border: "1px solid #ffcdd2" }}>
              <Typography variant="caption" sx={{ color: "#c62828", fontWeight: 500 }}>
                {isLocked ? `Too many attempts. Try again in ${remainingLockout}s.` : formError}
              </Typography>
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || isLocked}
            sx={{
              mt: 0.5, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: "0.95rem",
              textTransform: "none", backgroundColor: "#2E7D32", boxShadow: "none",
              "&:hover": { backgroundColor: "#1b5e20", boxShadow: "none" },
              "&.Mui-disabled": { backgroundColor: "#e0e0e0", color: "#9e9e9e" },
            }}
          >
            {loading ? "Signing in…" : isLocked ? `Locked (${remainingLockout}s)` : "Sign In"}
          </Button>

        </Box>
      </Box>
    </Box>
  );
}

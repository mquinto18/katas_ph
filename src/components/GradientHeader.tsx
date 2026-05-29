"use client";

import Image from "next/image";

export default function GradientHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Background image watermark */}
      <div
        style={{
          position: "fixed",
          top: "-60px",
          right: "-60px",
          width: "420px",
          height: "420px",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <Image src="/image.png" alt="" fill style={{ objectFit: "contain" }} priority />
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(200,230,201,0.55) 0%, rgba(240,244,195,0.45) 55%, rgba(255,249,196,0.5) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, height: 0, minHeight: "100%" }}>
        {children}
      </div>
    </div>
  );
}

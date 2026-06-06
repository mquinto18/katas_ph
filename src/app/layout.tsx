export const runtime = 'edge';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import GradientHeader from "@/components/GradientHeader";
import AppShell from "@/components/AppShell";
import { Toaster } from "react-hot-toast";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { BusinessSettingsProvider } from "@/context/BusinessSettingsContext";
import { PrinterProvider } from "@/context/PrinterContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Katas PH POS",
  description: "Point of Sale system for Katas PH",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full flex flex-col overflow-hidden">
        <ThemeRegistry>
          <CategoriesProvider>
            <BusinessSettingsProvider>
            <PrinterProvider>
              <GradientHeader>
                <AppShell>
                  {children}
                </AppShell>
              </GradientHeader>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: { borderRadius: "10px", fontSize: "0.875rem", fontWeight: 500 },
                  success: { style: { background: "#2E7D32", color: "#fff" }, iconTheme: { primary: "#fff", secondary: "#2E7D32" } },
                  error:   { style: { background: "#e53935", color: "#fff" }, iconTheme: { primary: "#fff", secondary: "#e53935" } },
                }}
              />
            </PrinterProvider>
            </BusinessSettingsProvider>
          </CategoriesProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

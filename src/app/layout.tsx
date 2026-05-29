import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";
import TopNav from "@/components/TopNav";
import GradientHeader from "@/components/GradientHeader";
import SideNav from "@/components/SideNav";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col overflow-hidden">
        <ThemeRegistry>
          <GradientHeader>
            <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
              <SideNav />
              <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}>
                <TopNav username="Admin" />
                {children}
              </div>
            </div>
          </GradientHeader>
        </ThemeRegistry>
      </body>
    </html>
  );
}

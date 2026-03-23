import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthSessionSync from "@/src/auth/components/AuthSessionSync";
import "./globals.css";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "SmashCourt",
  description: "Trình quản lý & Đặt sân Cầu lông Trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${interSans.variable} font-sans antialiased`}>
        <AuthSessionSync />
        {children}
      </body>
    </html>
  );
}

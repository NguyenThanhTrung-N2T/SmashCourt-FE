import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthSessionSync from "@/src/features/auth/components/AuthSessionSync";
import { ThemeProvider } from "@/src/contexts/ThemeContext";
import { themeInitScript } from "@/src/scripts/theme-init";
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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${interSans.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthSessionSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

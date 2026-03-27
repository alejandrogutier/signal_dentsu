import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signal Dentsu — GEO/AEO Tracker",
  description: "AI Visibility & SEO Intelligence Dashboard powered by SEMRush",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimary: "#3b82f6",
                colorBgBase: "#0b1121",
                colorBgContainer: "#111827",
                colorBgElevated: "#1e293b",
                colorBorder: "#1e293b",
                colorText: "#e2e8f0",
                colorTextSecondary: "#94a3b8",
                borderRadius: 8,
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

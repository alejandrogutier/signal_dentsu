"use client";

import { ConfigProvider, theme } from "antd";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

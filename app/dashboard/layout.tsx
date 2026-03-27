"use client";

import { useState } from "react";
import { Layout, Menu, Typography, Avatar, Dropdown } from "antd";
import {
  DashboardOutlined,
  SearchOutlined,
  TeamOutlined,
  EyeOutlined,
  LinkOutlined,
  AuditOutlined,
  FileTextOutlined,
  RadarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import type { MenuProps } from "antd";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems: MenuProps["items"] = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Overview" },
  { key: "/dashboard/keywords", icon: <SearchOutlined />, label: "Keywords" },
  { key: "/dashboard/competitors", icon: <TeamOutlined />, label: "Competitors" },
  { key: "/dashboard/ai-visibility", icon: <EyeOutlined />, label: "AI Visibility" },
  { key: "/dashboard/backlinks", icon: <LinkOutlined />, label: "Backlinks" },
  { key: "/dashboard/audit", icon: <AuditOutlined />, label: "Site Audit" },
  { type: "divider" as const },
  { key: "/dashboard/reports", icon: <FileTextOutlined />, label: "Reports" },
];

const userMenu: MenuProps["items"] = [
  { key: "logout", icon: <LogoutOutlined />, label: "Sign Out", danger: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    router.push(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        style={{
          borderRight: "1px solid #1e293b",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            padding: collapsed ? "20px 12px" : "20px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid #1e293b",
          }}
        >
          <RadarChartOutlined style={{ fontSize: 24, color: "#3b82f6" }} />
          {!collapsed && (
            <div>
              <Text strong style={{ color: "#e2e8f0", fontSize: 14, display: "block" }}>
                Signal Dentsu
              </Text>
              <Text style={{ color: "#64748b", fontSize: 11 }}>GEO/AEO Tracker</Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={onMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: "margin-left 0.2s" }}>
        <Header
          style={{
            background: "#0f172a",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #1e293b",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <div
            style={{ cursor: "pointer", color: "#94a3b8", fontSize: 18 }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Dropdown menu={{ items: userMenu }} trigger={["click"]}>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#3b82f6", cursor: "pointer" }}
            />
          </Dropdown>
        </Header>

        <Content style={{ padding: 24, minHeight: "calc(100vh - 64px)", overflow: "auto" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

"use client";

import { Button, Card, Typography, Space } from "antd";
import { LoginOutlined, RadarChartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card
        style={{ width: 420, textAlign: "center" }}
        styles={{ body: { padding: "48px 32px" } }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <RadarChartOutlined style={{ fontSize: 48, color: "#3b82f6" }} />
          <div>
            <Title level={3} style={{ margin: 0, color: "#e2e8f0" }}>
              Signal Dentsu
            </Title>
            <Text type="secondary">GEO/AEO Tracker</Text>
          </div>
          <Text type="secondary" style={{ display: "block" }}>
            AI Visibility & SEO Intelligence Dashboard
          </Text>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            href="/api/auth/login"
            block
          >
            Sign in with Cognito
          </Button>
        </Space>
      </Card>
    </div>
  );
}

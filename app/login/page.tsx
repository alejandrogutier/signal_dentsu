"use client";

import { useState } from "react";
import { Button, Card, Typography, Space, Input, Form, Alert } from "antd";
import { LoginOutlined, RadarChartOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card
        style={{ width: 420 }}
        styles={{ body: { padding: "48px 32px" } }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%", textAlign: "center" }}>
          <RadarChartOutlined style={{ fontSize: 48, color: "#3b82f6" }} />
          <div>
            <Title level={3} style={{ margin: 0, color: "#e2e8f0" }}>
              Signal Dentsu
            </Title>
            <Text type="secondary">GEO/AEO Tracker</Text>
          </div>
        </Space>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginTop: 24 }}
          />
        )}

        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 24 }}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Enter your email" }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#64748b" }} />}
              placeholder="Email"
              size="large"
              type="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#64748b" }} />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<LoginOutlined />}
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

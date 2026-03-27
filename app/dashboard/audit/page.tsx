"use client";

import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Progress,
  Tag,
  List,
  Spin,
  message,
} from "antd";
import {
  AuditOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface AuditCheck {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

interface AuditCategory {
  name: string;
  passed: number;
  total: number;
}

interface AuditData {
  url: string;
  score: number;
  totalChecks: number;
  passed: number;
  failed: number;
  checks: AuditCheck[];
  categories: AuditCategory[];
}

export default function AuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditData | null>(null);

  const runAudit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to audit");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#fbbf24";
    return "#f87171";
  };

  return (
    <div>
      <Title level={4} style={{ color: "#e2e8f0", marginBottom: 16 }}>
        <AuditOutlined /> Site Audit (AEO Readiness)
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: "100%", maxWidth: 600 }}>
          <Input
            placeholder="Enter URL (e.g. https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={runAudit}
            size="large"
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={runAudit} loading={loading} size="large">
            Run Audit
          </Button>
        </Space.Compact>
      </Card>

      {loading && (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Checking AEO readiness...</Text>
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Progress
                  type="circle"
                  percent={data.score}
                  strokeColor={scoreColor(data.score)}
                  size={120}
                  format={(p) => <span style={{ color: scoreColor(data.score), fontSize: 28 }}>{p}</span>}
                />
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">AEO Score</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Row gutter={[16, 16]}>
                {data.categories.map((cat) => (
                  <Col xs={12} sm={8} key={cat.name}>
                    <Card size="small">
                      <Text type="secondary" style={{ fontSize: 12 }}>{cat.name}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text strong style={{ color: "#e2e8f0", fontSize: 18 }}>
                          {cat.passed}/{cat.total}
                        </Text>
                      </div>
                      <Progress
                        percent={Math.round((cat.passed / cat.total) * 100)}
                        size="small"
                        strokeColor={cat.passed === cat.total ? "#34d399" : "#fbbf24"}
                        showInfo={false}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>

          <Card title="Detailed Checks" size="small">
            <List
              dataSource={data.checks}
              renderItem={(check) => (
                <List.Item>
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Space>
                      {check.passed ? (
                        <CheckCircleOutlined style={{ color: "#34d399" }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: "#f87171" }} />
                      )}
                      <Text style={{ color: "#e2e8f0" }}>{check.name}</Text>
                      <Tag>{check.category}</Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>{check.details}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </>
      )}
    </div>
  );
}

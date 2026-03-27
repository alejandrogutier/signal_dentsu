"use client";

import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Typography,
  Space,
  Spin,
  message,
  Progress,
} from "antd";
import { TeamOutlined, SearchOutlined, GlobalOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Competitor {
  domain: string;
  competitorRelevance: number;
  commonKeywords: number;
  organicKeywords: number;
  organicTraffic: number;
  organicCost: number;
}

export default function CompetitorsPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  const fetchCompetitors = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/semrush/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), limit: 30 }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setCompetitors(json.competitors ?? []);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const maxRelevance = Math.max(...competitors.map((c) => c.competitorRelevance), 1);

  const columns = [
    {
      title: "Competitor",
      dataIndex: "domain",
      key: "domain",
      render: (d: string) => (
        <Space>
          <GlobalOutlined style={{ color: "#64748b" }} />
          <Text strong style={{ color: "#e2e8f0" }}>{d}</Text>
        </Space>
      ),
    },
    {
      title: "Relevance",
      dataIndex: "competitorRelevance",
      key: "competitorRelevance",
      sorter: (a: Competitor, b: Competitor) => a.competitorRelevance - b.competitorRelevance,
      render: (v: number) => (
        <Progress
          percent={Math.round((v / maxRelevance) * 100)}
          size="small"
          strokeColor="#3b82f6"
          format={() => v.toFixed(2)}
        />
      ),
    },
    {
      title: "Common Keywords",
      dataIndex: "commonKeywords",
      key: "commonKeywords",
      sorter: (a: Competitor, b: Competitor) => a.commonKeywords - b.commonKeywords,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "Organic Keywords",
      dataIndex: "organicKeywords",
      key: "organicKeywords",
      sorter: (a: Competitor, b: Competitor) => a.organicKeywords - b.organicKeywords,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "Organic Traffic",
      dataIndex: "organicTraffic",
      key: "organicTraffic",
      sorter: (a: Competitor, b: Competitor) => a.organicTraffic - b.organicTraffic,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "Traffic Cost",
      dataIndex: "organicCost",
      key: "organicCost",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ color: "#e2e8f0", marginBottom: 16 }}>
        <TeamOutlined /> Competitor Analysis
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: "100%", maxWidth: 500 }}>
          <Input
            placeholder="Enter your domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onPressEnter={fetchCompetitors}
            prefix={<GlobalOutlined style={{ color: "#64748b" }} />}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchCompetitors} loading={loading}>
            Find Competitors
          </Button>
        </Space.Compact>
      </Card>

      {loading && (
        <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>
      )}

      {!loading && competitors.length > 0 && (
        <Card title={`Organic Competitors (${competitors.length})`} size="small">
          <Table
            dataSource={competitors}
            columns={columns}
            rowKey="domain"
            pagination={{ pageSize: 20 }}
            size="small"
            scroll={{ x: 800 }}
          />
        </Card>
      )}
    </div>
  );
}

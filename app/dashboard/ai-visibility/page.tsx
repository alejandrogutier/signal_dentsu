"use client";

import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Spin,
  message,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  RobotOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface FeatureSummary {
  code: string;
  label: string;
  count: number;
  isAiFeature: boolean;
}

interface AiKeyword {
  keyword: string;
  position: number;
  searchVolume: number;
  trafficPercent: number;
}

interface SerpData {
  totalKeywordsAnalyzed: number;
  aiOverviewCount: number;
  aiOverviewKeywords: AiKeyword[];
  featureSummary: FeatureSummary[];
  aiFeatures: FeatureSummary[];
}

export default function AiVisibilityPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SerpData | null>(null);

  const fetchData = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/semrush/serp-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), limit: 200 }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const aiKeywordColumns = [
    {
      title: "Keyword",
      dataIndex: "keyword",
      key: "keyword",
      render: (t: string) => <Text strong style={{ color: "#e2e8f0" }}>{t}</Text>,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 100,
      sorter: (a: AiKeyword, b: AiKeyword) => a.position - b.position,
    },
    {
      title: "Volume",
      dataIndex: "searchVolume",
      key: "searchVolume",
      sorter: (a: AiKeyword, b: AiKeyword) => a.searchVolume - b.searchVolume,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "Traffic %",
      dataIndex: "trafficPercent",
      key: "trafficPercent",
      render: (v: number) => `${v.toFixed(2)}%`,
    },
  ];

  return (
    <div>
      <Title level={4} style={{ color: "#e2e8f0", marginBottom: 16 }}>
        <EyeOutlined /> AI Visibility
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: "100%", maxWidth: 500 }}>
          <Input
            placeholder="Enter domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onPressEnter={fetchData}
            prefix={<GlobalOutlined style={{ color: "#64748b" }} />}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchData} loading={loading}>
            Analyze AI Visibility
          </Button>
        </Space.Compact>
      </Card>

      {loading && (
        <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>
      )}

      {data && !loading && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Keywords Analyzed"
                  value={data.totalKeywordsAnalyzed}
                  prefix={<SearchOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="In AI Overviews"
                  value={data.aiOverviewCount}
                  prefix={<RobotOutlined />}
                  valueStyle={{ color: "#fbbf24" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="AI Visibility Rate"
                  value={data.totalKeywordsAnalyzed > 0
                    ? ((data.aiOverviewCount / data.totalKeywordsAnalyzed) * 100).toFixed(1)
                    : 0}
                  suffix="%"
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: "#34d399" }}
                />
              </Card>
            </Col>
          </Row>

          {data.aiFeatures.length > 0 && (
            <Card
              title="AI SERP Features Detected"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Space wrap>
                {data.aiFeatures.map((f) => (
                  <Tag key={f.code} color="blue" style={{ fontSize: 13, padding: "4px 12px" }}>
                    {f.label}: {f.count}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          <Card
            title="All SERP Features"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Space wrap>
              {data.featureSummary.map((f) => (
                <Tag
                  key={f.code}
                  color={f.isAiFeature ? "blue" : "default"}
                >
                  {f.label}: {f.count}
                </Tag>
              ))}
            </Space>
          </Card>

          {data.aiOverviewKeywords.length > 0 && (
            <Card title="Keywords Appearing in AI Overviews" size="small">
              <Table
                dataSource={data.aiOverviewKeywords}
                columns={aiKeywordColumns}
                rowKey="keyword"
                pagination={{ pageSize: 20 }}
                size="small"
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

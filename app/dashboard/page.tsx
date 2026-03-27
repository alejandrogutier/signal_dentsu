"use client";

import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Input,
  Button,
  Typography,
  Space,
  Table,
  Tag,
  Spin,
  Select,
  message,
} from "antd";
import {
  SearchOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  LinkOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface DomainData {
  domain: string;
  summary: {
    organicKeywords: number;
    organicTraffic: number;
    aiOverviewCount: number;
    totalBacklinks: number;
    referringDomains: number;
  };
  keywords: {
    keyword: string;
    position: number;
    previousPosition: number;
    searchVolume: number;
    trafficPercent: number;
    serpFeatures: string[];
  }[];
  aiOverviewKeywords: {
    keyword: string;
    position: number;
    searchVolume: number;
  }[];
}

export default function DashboardOverview() {
  const [domain, setDomain] = useState("");
  const [database, setDatabase] = useState("us");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DomainData | null>(null);

  const fetchDomain = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/semrush/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), database, limit: 50 }),
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

  const columns = [
    {
      title: "Keyword",
      dataIndex: "keyword",
      key: "keyword",
      render: (text: string) => <Text strong style={{ color: "#e2e8f0" }}>{text}</Text>,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 100,
      sorter: (a: DomainData["keywords"][0], b: DomainData["keywords"][0]) => a.position - b.position,
      render: (pos: number, record: DomainData["keywords"][0]) => {
        const diff = record.previousPosition - pos;
        return (
          <Space>
            <Text style={{ color: "#e2e8f0" }}>{pos}</Text>
            {diff > 0 && <Tag color="green" icon={<RiseOutlined />}>{diff}</Tag>}
            {diff < 0 && <Tag color="red" icon={<FallOutlined />}>{Math.abs(diff)}</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Volume",
      dataIndex: "searchVolume",
      key: "searchVolume",
      width: 100,
      sorter: (a: DomainData["keywords"][0], b: DomainData["keywords"][0]) => a.searchVolume - b.searchVolume,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "Traffic %",
      dataIndex: "trafficPercent",
      key: "trafficPercent",
      width: 100,
      render: (v: number) => `${v.toFixed(2)}%`,
    },
    {
      title: "SERP Features",
      dataIndex: "serpFeatures",
      key: "serpFeatures",
      render: (features: string[]) =>
        features.slice(0, 3).map((f) => (
          <Tag
            key={f}
            color={f.startsWith("ai") ? "blue" : "default"}
            style={{ fontSize: 11 }}
          >
            {f}
          </Tag>
        )),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: "#e2e8f0", marginBottom: 16 }}>
          Domain Overview
        </Title>
        <Space wrap>
          <Input
            placeholder="Enter domain (e.g. mitosdecolombia.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onPressEnter={fetchDomain}
            prefix={<GlobalOutlined style={{ color: "#64748b" }} />}
            size="large"
            style={{ width: 400 }}
          />
          <Select
            value={database}
            onChange={setDatabase}
            size="large"
            style={{ width: 160 }}
            options={[
              { value: "us", label: "🇺🇸 United States" },
              { value: "uk", label: "🇬🇧 United Kingdom" },
              { value: "mx", label: "🇲🇽 Mexico" },
              { value: "es", label: "🇪🇸 Spain" },
              { value: "br", label: "🇧🇷 Brazil" },
              { value: "co", label: "🇨🇴 Colombia" },
              { value: "ar", label: "🇦🇷 Argentina" },
              { value: "cl", label: "🇨🇱 Chile" },
              { value: "ca", label: "🇨🇦 Canada" },
              { value: "de", label: "🇩🇪 Germany" },
              { value: "fr", label: "🇫🇷 France" },
              { value: "it", label: "🇮🇹 Italy" },
            ]}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={fetchDomain}
            loading={loading}
            size="large"
          >
            Analyze
          </Button>
        </Space>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Fetching data from SEMRush...</Text>
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title="Organic Keywords"
                  value={data.summary.organicKeywords}
                  prefix={<SearchOutlined />}
                  valueStyle={{ color: "#3b82f6" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title="Organic Traffic"
                  value={data.summary.organicTraffic}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: "#34d399" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title="AI Overview Keywords"
                  value={data.summary.aiOverviewCount}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: "#fbbf24" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title="Backlinks"
                  value={data.summary.totalBacklinks}
                  prefix={<LinkOutlined />}
                  valueStyle={{ color: "#a78bfa" }}
                />
              </Card>
            </Col>
          </Row>

          {data.aiOverviewKeywords.length > 0 && (
            <Card
              title={
                <Space>
                  <EyeOutlined style={{ color: "#fbbf24" }} />
                  <span>Keywords in AI Overviews</span>
                  <Tag color="gold">{data.aiOverviewKeywords.length}</Tag>
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Space wrap>
                {data.aiOverviewKeywords.map((kw) => (
                  <Tag key={kw.keyword} color="blue">
                    {kw.keyword} (#{kw.position})
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          <Card title="Top Organic Keywords" size="small">
            <Table
              dataSource={data.keywords}
              columns={columns}
              rowKey="keyword"
              pagination={{ pageSize: 15, showSizeChanger: false }}
              size="small"
              scroll={{ x: 700 }}
            />
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <GlobalOutlined style={{ fontSize: 48, color: "#64748b", marginBottom: 16 }} />
          <Title level={5} style={{ color: "#94a3b8" }}>
            Enter a domain to get started
          </Title>
          <Text type="secondary">
            Analyze organic keywords, AI visibility, backlinks, and competitors
          </Text>
        </Card>
      )}
    </div>
  );
}

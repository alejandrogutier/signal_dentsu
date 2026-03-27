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
  Select,
  Spin,
  message,
  Tabs,
} from "antd";
import { SearchOutlined, QuestionCircleOutlined, BranchesOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface KeywordData {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  numberOfResults: number;
  difficulty?: number;
  trends: number[];
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState("");
  const [database, setDatabase] = useState("us");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordData[]>([]);
  const [related, setRelated] = useState<KeywordData[]>([]);
  const [questions, setQuestions] = useState<KeywordData[]>([]);

  const fetchKeywords = async (action: string) => {
    const kwList = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (kwList.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/semrush/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: kwList, database, action }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      if (action === "overview") setData(json.keywords ?? []);
      else if (action === "related") setRelated(json.related ?? []);
      else if (action === "questions") setQuestions(json.questions ?? []);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    await fetchKeywords("overview");
    await Promise.all([fetchKeywords("related"), fetchKeywords("questions")]);
  };

  const difficultyColor = (d: number) => {
    if (d >= 80) return "red";
    if (d >= 60) return "orange";
    if (d >= 40) return "gold";
    return "green";
  };

  const columns = [
    {
      title: "Keyword",
      dataIndex: "keyword",
      key: "keyword",
      render: (t: string) => <Text strong style={{ color: "#e2e8f0" }}>{t}</Text>,
    },
    {
      title: "Volume",
      dataIndex: "searchVolume",
      key: "searchVolume",
      sorter: (a: KeywordData, b: KeywordData) => a.searchVolume - b.searchVolume,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      sorter: (a: KeywordData, b: KeywordData) => (a.difficulty ?? 0) - (b.difficulty ?? 0),
      render: (d: number | undefined) =>
        d != null ? <Tag color={difficultyColor(d)}>{d}</Tag> : "-",
    },
    {
      title: "CPC",
      dataIndex: "cpc",
      key: "cpc",
      render: (v: number) => `$${v.toFixed(2)}`,
    },
    {
      title: "Competition",
      dataIndex: "competition",
      key: "competition",
      render: (v: number) => (v * 100).toFixed(0) + "%",
    },
    {
      title: "Results",
      dataIndex: "numberOfResults",
      key: "numberOfResults",
      render: (v: number) => v.toLocaleString(),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ color: "#e2e8f0", marginBottom: 16 }}>
        Keyword Research
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: "100%" }}>
          <Input
            placeholder="Enter keywords (comma separated)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onPressEnter={fetchAll}
            prefix={<SearchOutlined style={{ color: "#64748b" }} />}
            style={{ width: 400 }}
          />
          <Select
            value={database}
            onChange={setDatabase}
            style={{ width: 120 }}
            options={[
              { value: "us", label: "US" },
              { value: "uk", label: "UK" },
              { value: "mx", label: "Mexico" },
              { value: "es", label: "Spain" },
              { value: "br", label: "Brazil" },
              { value: "co", label: "Colombia" },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchAll} loading={loading}>
            Research
          </Button>
        </Space>
      </Card>

      {loading && (
        <div style={{ textAlign: "center", padding: 80 }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && (data.length > 0 || related.length > 0 || questions.length > 0) && (
        <Tabs
          items={[
            {
              key: "overview",
              label: `Overview (${data.length})`,
              icon: <SearchOutlined />,
              children: (
                <Table
                  dataSource={data}
                  columns={columns}
                  rowKey="keyword"
                  pagination={{ pageSize: 20 }}
                  size="small"
                />
              ),
            },
            {
              key: "related",
              label: `Related (${related.length})`,
              icon: <BranchesOutlined />,
              children: (
                <Table
                  dataSource={related}
                  columns={columns}
                  rowKey="keyword"
                  pagination={{ pageSize: 20 }}
                  size="small"
                />
              ),
            },
            {
              key: "questions",
              label: `Questions (${questions.length})`,
              icon: <QuestionCircleOutlined />,
              children: (
                <Table
                  dataSource={questions}
                  columns={columns}
                  rowKey="keyword"
                  pagination={{ pageSize: 20 }}
                  size="small"
                />
              ),
            },
          ]}
        />
      )}
    </div>
  );
}

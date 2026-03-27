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
  Statistic,
  Spin,
  Progress,
  message,
} from "antd";
import {
  LinkOutlined,
  SearchOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  ClusterOutlined,
  PictureOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface BacklinkData {
  domain: string;
  total: number;
  domainsNum: number;
  urlsNum: number;
  ipsNum: number;
  followsNum: number;
  nofollowsNum: number;
  textsNum: number;
  imagesNum: number;
  followRatio: string;
}

export default function BacklinksPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BacklinkData | null>(null);

  const fetchBacklinks = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/semrush/backlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
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

  return (
    <div>
      <Title level={4} style={{ color: "#e2e8f0", marginBottom: 16 }}>
        <LinkOutlined /> Backlink Analysis
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: "100%", maxWidth: 500 }}>
          <Input
            placeholder="Enter domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onPressEnter={fetchBacklinks}
            prefix={<GlobalOutlined style={{ color: "#64748b" }} />}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchBacklinks} loading={loading}>
            Analyze Backlinks
          </Button>
        </Space.Compact>
      </Card>

      {loading && (
        <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>
      )}

      {data && !loading && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title="Total Backlinks"
                  value={data.total}
                  prefix={<LinkOutlined />}
                  valueStyle={{ color: "#3b82f6" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title="Referring Domains"
                  value={data.domainsNum}
                  prefix={<GlobalOutlined />}
                  valueStyle={{ color: "#34d399" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title="Referring IPs"
                  value={data.ipsNum}
                  prefix={<ClusterOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card size="small">
                <Statistic
                  title="Referring URLs"
                  value={data.urlsNum}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Follow vs Nofollow" size="small">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <span><SafetyCertificateOutlined style={{ color: "#34d399" }} /> Follow</span>
                      <span>{data.followsNum.toLocaleString()}</span>
                    </Space>
                    <Progress
                      percent={parseFloat(data.followRatio)}
                      strokeColor="#34d399"
                      showInfo={false}
                    />
                  </div>
                  <div>
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <span><SafetyCertificateOutlined style={{ color: "#f87171" }} /> Nofollow</span>
                      <span>{data.nofollowsNum.toLocaleString()}</span>
                    </Space>
                    <Progress
                      percent={100 - parseFloat(data.followRatio)}
                      strokeColor="#f87171"
                      showInfo={false}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Link Types" size="small">
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                  <Statistic
                    title="Text Links"
                    value={data.textsNum}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ fontSize: 20 }}
                  />
                  <Statistic
                    title="Image Links"
                    value={data.imagesNum}
                    prefix={<PictureOutlined />}
                    valueStyle={{ fontSize: 20 }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

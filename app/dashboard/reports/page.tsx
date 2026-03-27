"use client";

import { Card, Typography, Empty, Button, Space } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ReportsPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={4} style={{ color: "#e2e8f0", margin: 0 }}>
          <FileTextOutlined /> Reports
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          New Report
        </Button>
      </div>

      <Card size="small">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size="small">
              <Text type="secondary">No reports yet</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Reports will be saved here when you run domain analyses, keyword research, or site audits.
                Connect AWS RDS to enable persistence.
              </Text>
            </Space>
          }
        />
      </Card>
    </div>
  );
}

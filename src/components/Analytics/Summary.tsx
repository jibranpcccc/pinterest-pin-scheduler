import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface AnalyticsSummaryProps {
  data: {
    impressions: number
    saves: number
    clicks: number
    engagement: number
  }
  loading: boolean
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  data,
  loading,
}) => {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Impressions"
            value={data.impressions}
            loading={loading}
            prefix={<ArrowUpOutlined />}
            suffix="%"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Saves"
            value={data.saves}
            loading={loading}
            prefix={<ArrowUpOutlined />}
            suffix="%"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Clicks"
            value={data.clicks}
            loading={loading}
            prefix={<ArrowUpOutlined />}
            suffix="%"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Engagement Rate"
            value={data.engagement}
            loading={loading}
            precision={2}
            prefix={<ArrowUpOutlined />}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  )
}

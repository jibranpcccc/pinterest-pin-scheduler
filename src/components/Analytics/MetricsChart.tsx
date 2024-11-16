import React, { useMemo } from 'react'
import { Line } from '@ant-design/plots'
import { Spin } from 'antd'
import { PinAnalytics } from '../../types'

interface MetricsChartProps {
  data: PinAnalytics[]
  metrics: string[]
  loading: boolean
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  metrics,
  loading,
}) => {
  const chartData = useMemo(() => {
    return data.flatMap((item) =>
      metrics.map((metric) => ({
        date: item.date,
        value: item[metric as keyof PinAnalytics] as number,
        metric: metric.charAt(0).toUpperCase() + metric.slice(1),
      }))
    )
  }, [data, metrics])

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'metric',
    xAxis: {
      type: 'time',
      tickCount: 5,
    },
    yAxis: {
      label: {
        formatter: (v: string) =>
          Number(v).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          }),
      },
    },
    tooltip: {
      showMarkers: false,
      shared: true,
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
    },
    slider: {
      start: 0,
      end: 1,
      trendCfg: {
        isArea: true,
      },
    },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ height: 400 }}>
      <Line {...config} />
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

interface DataPoint {
  date: string
  value: number
}

interface AnalyticsChartProps {
  data: DataPoint[]
  label: string
  color?: string
  height?: number
}

export default function AnalyticsChart({
  data,
  label,
  color = '#E11D48',
  height = 300,
}: AnalyticsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
          {
            label,
            data: sortedData.map(d => d.value),
            borderColor: color,
            backgroundColor: `${color}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1F2937',
            titleColor: '#F3F4F6',
            bodyColor: '#F3F4F6',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 13,
            },
            callbacks: {
              label: (context) => {
                return `${label}: ${context.parsed.y.toLocaleString()}`
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#E5E7EB',
            },
            ticks: {
              callback: (value) => value.toLocaleString(),
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, label, color])

  return (
    <div style={{ height }}>
      <canvas ref={chartRef} />
    </div>
  )
}

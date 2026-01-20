export interface MetricData {
  title: string
  value: string
  change: string
  isPositive: boolean
  type?: 'usage'
  usagePercent?: number
}

export interface ChartDataPoint {
  date: string
  total: number
  qualified: number
}

export interface LeadActivity {
  id: string
  avatar: string
  name: string
  project: string
  channel: string
  channelIcon: string
  duration: string
  status: 'Qualified' | 'Pending' | 'NotInterested'
}
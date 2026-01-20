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
  action: string
  agent: {
    type: 'ai' | 'human'
    name: string
  }
  duration: string
  score: number
}

export interface AttentionLead {
  id: string
  avatar: string
  name: string
  reason: 'human_requested' | 'high_score' | 'no_response'
  reasonText: string
  project: string
  timeAgo: string
  score?: number
}

export interface LiveConversation {
  id: string
  avatar: string
  name: string
  project: string
  status: 'typing' | 'waiting'
  lastActivity: string
  agentType: 'emprendimientos' | 'inmuebles' | 'tasaciones'
}

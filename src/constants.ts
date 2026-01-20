import { ChartDataPoint, LeadActivity, MetricData, AttentionLead, LiveConversation } from './types'

export const METRICS: MetricData[] = [
  {
    title: "Leads Totales",
    value: "127,482",
    change: "+23%",
    isPositive: true,
  },
  {
    title: "Conversaciones Activas",
    value: "42",
    change: "+4%",
    isPositive: true,
  },
  {
    title: "Tasa de Conversión",
    value: "68.7%",
    change: "+0.4%",
    isPositive: true,
  },
  {
    title: "Calificados Hoy",
    value: "18",
    change: "",
    isPositive: true,
  },
]

export const CHART_DATA: ChartDataPoint[] = [
  { date: 'Dic 1', total: 4000, qualified: 2400 },
  { date: 'Dic 5', total: 5800, qualified: 3200 },
  { date: 'Dic 8', total: 4200, qualified: 3800 },
  { date: 'Dic 12', total: 2800, qualified: 2100 },
  { date: 'Dic 15', total: 5100, qualified: 2800 },
  { date: 'Dic 22', total: 4500, qualified: 2100 },
  { date: 'Dic 26', total: 6800, qualified: 4200 },
  { date: 'Dic 29', total: 5900, qualified: 5100 },
]

export const ATTENTION_LEADS: AttentionLead[] = [
  {
    id: '1',
    avatar: 'https://picsum.photos/40/40?random=10',
    name: 'Juan Martinez',
    reason: 'human_requested',
    reasonText: 'Pidió hablar con humano',
    project: 'Roccatagliata',
    timeAgo: 'Hace 5 min',
    score: 85,
  },
  {
    id: '2',
    avatar: 'https://picsum.photos/40/40?random=11',
    name: 'María López',
    reason: 'high_score',
    reasonText: 'Score 95, sin contactar',
    project: 'Huergo 475',
    timeAgo: 'Hace 2 horas',
    score: 95,
  },
  {
    id: '3',
    avatar: 'https://picsum.photos/40/40?random=12',
    name: 'Carlos Ruiz',
    reason: 'no_response',
    reasonText: '2 días sin respuesta',
    project: 'Human Abasto',
    timeAgo: 'Hace 2 días',
    score: 72,
  },
]

export const LIVE_CONVERSATIONS: LiveConversation[] = [
  {
    id: '1',
    avatar: 'https://picsum.photos/32/32?random=20',
    name: 'Juan',
    project: 'Roccatagliata',
    status: 'typing',
    lastActivity: 'Escribiendo...',
    agentType: 'emprendimientos',
  },
  {
    id: '2',
    avatar: 'https://picsum.photos/32/32?random=21',
    name: 'Carlos',
    project: 'Huergo 475',
    status: 'waiting',
    lastActivity: '2 min',
    agentType: 'emprendimientos',
  },
  {
    id: '3',
    avatar: 'https://picsum.photos/32/32?random=22',
    name: 'Ana',
    project: 'Palermo Soho',
    status: 'waiting',
    lastActivity: '5 min',
    agentType: 'inmuebles',
  },
  {
    id: '4',
    avatar: 'https://picsum.photos/32/32?random=23',
    name: 'Miguel',
    project: 'Tasación Belgrano',
    status: 'waiting',
    lastActivity: '8 min',
    agentType: 'tasaciones',
  },
]

export const RECENT_ACTIVITY: LeadActivity[] = [
  {
    id: '1',
    avatar: 'https://picsum.photos/32/32?random=1',
    name: 'María González',
    project: 'Roccatagliata',
    action: 'Calificado',
    agent: { type: 'ai', name: 'Emp' },
    duration: '4.2 min',
    score: 92,
  },
  {
    id: '2',
    avatar: 'https://picsum.photos/32/32?random=2',
    name: 'Juan Martinez',
    project: 'Huergo 475',
    action: 'Brochure enviado',
    agent: { type: 'ai', name: 'Emp' },
    duration: '1.5 min',
    score: 75,
  },
  {
    id: '3',
    avatar: 'https://picsum.photos/32/32?random=3',
    name: 'Roberto Sánchez',
    project: 'Human Abasto',
    action: 'Visita agendada',
    agent: { type: 'human', name: 'Jony' },
    duration: '12 min',
    score: 95,
  },
  {
    id: '4',
    avatar: 'https://picsum.photos/32/32?random=4',
    name: 'Ana Martínez',
    project: 'Palermo Chico',
    action: 'Calificado',
    agent: { type: 'ai', name: 'Inm' },
    duration: '3.8 min',
    score: 88,
  },
  {
    id: '5',
    avatar: 'https://picsum.photos/32/32?random=5',
    name: 'Laura Fernández',
    project: 'Roccatagliata',
    action: 'Tipología enviada',
    agent: { type: 'ai', name: 'Emp' },
    duration: '2.1 min',
    score: 67,
  },
]

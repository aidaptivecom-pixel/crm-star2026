import { ChartDataPoint, LeadActivity, MetricData } from './types'

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
    title: "Tasa de Calificación",
    value: "98.7%",
    change: "+0.4%",
    isPositive: true,
  },
  {
    title: "Agentes Activos",
    value: "7",
    change: "",
    isPositive: true,
    type: 'usage',
    usagePercent: 70
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

export const RECENT_ACTIVITY: LeadActivity[] = [
  {
    id: '1',
    avatar: 'https://picsum.photos/32/32?random=1',
    name: 'María González',
    project: 'Torre Horizon',
    channel: 'WhatsApp',
    channelIcon: 'MessageCircle',
    duration: '1.2s',
    status: 'Qualified',
  },
  {
    id: '2',
    avatar: 'https://picsum.photos/32/32?random=2',
    name: 'Carlos Rodríguez',
    project: 'Villa Verde',
    channel: 'Instagram',
    channelIcon: 'Instagram',
    duration: '4.5s',
    status: 'Qualified',
  },
  {
    id: '3',
    avatar: 'https://picsum.photos/32/32?random=3',
    name: 'Ana Martínez',
    project: 'Lofts Central',
    channel: 'WhatsApp',
    channelIcon: 'MessageCircle',
    duration: '2.1s',
    status: 'Pending',
  },
  {
    id: '4',
    avatar: 'https://picsum.photos/32/32?random=4',
    name: 'Roberto Sánchez',
    project: 'Residencial Park',
    channel: 'WhatsApp',
    channelIcon: 'MessageCircle',
    duration: '2.8s',
    status: 'Qualified',
  },
  {
    id: '5',
    avatar: 'https://picsum.photos/32/32?random=5',
    name: 'Laura Fernández',
    project: 'Torre Horizon',
    channel: 'Instagram',
    channelIcon: 'Instagram',
    duration: '0.8s',
    status: 'NotInterested',
  },
  {
    id: '6',
    avatar: 'https://picsum.photos/32/32?random=6',
    name: 'Diego López',
    project: 'Villa Sol',
    channel: 'WhatsApp',
    channelIcon: 'MessageCircle',
    duration: '1.5s',
    status: 'Qualified',
  },
]
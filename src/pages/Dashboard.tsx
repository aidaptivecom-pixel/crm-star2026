import { Header } from '../components/Header'
import { MetricCard } from '../components/MetricCard'
import { AttentionAlerts } from '../components/AttentionAlerts'
import { LeadsChart } from '../components/LeadsChart'
import { LiveConversations } from '../components/LiveConversations'
import { RecentActivityTable } from '../components/RecentActivityTable'
import { MetricCardSkeleton, AttentionCardSkeleton, ChartSkeleton, LiveConversationsSkeleton, ActivityTableSkeleton } from '../components/Skeleton'
import { useLeads, useConversations } from '../hooks'
import { MetricData, AttentionLead, LiveConversation as LiveConvType, LeadActivity } from '../types'
import { mapLeadToAttentionLead, mapDbConversationToLive, mapLeadToActivity } from '../lib/mappers'

export const Dashboard = () => {
  const { leads, loading: leadsLoading, stats: leadStats } = useLeads()
  const { conversations, loading: convsLoading, stats: convStats } = useConversations()

  const loading = leadsLoading || convsLoading

  // Compute metrics from real data
  const qualified = leadStats.calificado + leadStats.contactado + leadStats.visita + leadStats.cierre
  const conversionRate = leadStats.total > 0
    ? ((qualified / leadStats.total) * 100).toFixed(1)
    : '0'

  const metrics: MetricData[] = [
    {
      title: 'Leads Totales',
      value: leadStats.total.toLocaleString(),
      change: '',
      isPositive: true,
    },
    {
      title: 'Conversaciones Activas',
      value: convStats.active.toString(),
      change: '',
      isPositive: true,
    },
    {
      title: 'Tasa de Conversión',
      value: `${conversionRate}%`,
      change: '',
      isPositive: true,
    },
    {
      title: 'Calificados',
      value: leadStats.calificado.toString(),
      change: '',
      isPositive: true,
    },
  ]

  // Build attention leads: high score unassigned leads
  const attentionLeads: AttentionLead[] = leads
    .filter(l => (l.score || 0) >= 70 && !l.assigned_to)
    .slice(0, 5)
    .map(l => mapLeadToAttentionLead(l, 'high_score', `Score ${l.score}, sin asignar`))

  // Live conversations (non-closed)
  const liveConversations: LiveConvType[] = conversations
    .filter(c => c.status !== 'closed')
    .slice(0, 6)
    .map(mapDbConversationToLive)

  // Recent activity from latest leads
  const recentActivity: LeadActivity[] = leads
    .slice(0, 5)
    .map(mapLeadToActivity)

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-[#F8F9FA]">
        <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
          <Header />
          
          {/* Skeleton Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[1, 2, 3, 4].map((i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>

          {/* Skeleton Attention Alerts */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AttentionCardSkeleton />
              <AttentionCardSkeleton />
            </div>
          </div>

          {/* Skeleton Chart + Live */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 items-stretch">
            <div className="lg:col-span-2 h-full">
              <ChartSkeleton />
            </div>
            <div className="lg:col-span-1 h-full">
              <LiveConversationsSkeleton />
            </div>
          </div>

          {/* Skeleton Activity Table */}
          <ActivityTableSkeleton />
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FA]">
      <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        
        <Header />

        {/* Metrics Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} data={metric} />
          ))}
        </div>

        {/* Attention Alerts */}
        <AttentionAlerts leads={attentionLeads} />

        {/* Chart + Live Conversations - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 items-stretch">
          <div className="lg:col-span-2 h-full">
            <LeadsChart />
          </div>
          <div className="lg:col-span-1 h-full">
            <LiveConversations conversations={liveConversations} />
          </div>
        </div>

        {/* Activity Table */}
        <div>
          <RecentActivityTable activities={recentActivity} />
        </div>

      </div>
    </main>
  )
}

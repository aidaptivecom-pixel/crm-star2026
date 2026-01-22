import { Header } from '../components/Header'
import { MetricCard } from '../components/MetricCard'
import { AttentionAlerts } from '../components/AttentionAlerts'
import { LeadsChart } from '../components/LeadsChart'
import { LiveConversations } from '../components/LiveConversations'
import { RecentActivityTable } from '../components/RecentActivityTable'
import { METRICS } from '../constants'

export const Dashboard = () => {
  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FA]">
      <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        
        <Header />

        {/* Metrics Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {METRICS.map((metric, index) => (
            <MetricCard key={index} data={metric} />
          ))}
        </div>

        {/* Attention Alerts */}
        <AttentionAlerts />

        {/* Chart + Live Conversations - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <LeadsChart />
          </div>
          <div className="lg:col-span-1">
            <LiveConversations />
          </div>
        </div>

        {/* Activity Table */}
        <div>
          <RecentActivityTable />
        </div>

      </div>
    </main>
  )
}

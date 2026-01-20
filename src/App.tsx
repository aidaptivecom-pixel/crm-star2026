import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { MetricCard } from './components/MetricCard'
import { LeadsChart } from './components/LeadsChart'
import { RecentActivityTable } from './components/RecentActivityTable'
import { METRICS } from './constants'

function App() {
  return (
    <div className="min-h-screen bg-[#D1D5DB] p-4 font-sans">
      {/* Main Container with rounded corners */}
      <div className="flex min-h-[calc(100vh-32px)] bg-[#F8F9FA] rounded-3xl overflow-hidden shadow-xl">
        
        {/* Sidebar - inside the container */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#F8F9FA]">
          <div className="max-w-[1400px] mx-auto p-8">
            
            <Header />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {METRICS.map((metric, index) => (
                <MetricCard key={index} data={metric} />
              ))}
            </div>

            {/* Chart Section */}
            <div className="mb-8">
              <LeadsChart />
            </div>

            {/* Activity Table */}
            <div>
              <RecentActivityTable />
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default App

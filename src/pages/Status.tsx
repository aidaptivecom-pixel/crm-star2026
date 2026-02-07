import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Activity, Server, Database, Brain, Zap, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

const SCRAPER_URL = 'https://scraper-star.135.181.24.249.sslip.io'

interface HealthData {
  status: 'ok' | 'degraded' | 'error'
  uptime_seconds: number
  uptime_human: string
  checks: {
    supabase: { status: string; latency_ms: number; error?: string }
    openai_configured: boolean
    apify_configured: boolean
  }
  stats: {
    estimates_today: number
    formal_estimates_today: number
    target_analyses_today: number
    errors_last_24h: number
    last_estimate_at: string | null
    last_error: string | null
  }
  memory: {
    rss_mb: number
    heap_used_mb: number
  }
}

const StatusDot = ({ ok }: { ok: boolean }) => (
  <span className={`inline-block w-3 h-3 rounded-full ${ok ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
)

export const Status = () => {
  const [data, setData] = useState<HealthData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true)
      const r = await fetch(`${SCRAPER_URL}/health`, { signal: AbortSignal.timeout(10000) })
      const json = await r.json()
      setData(json)
      setError(null)
      setLastRefresh(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Connection failed')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
    const iv = setInterval(fetchHealth, 30000)
    return () => clearInterval(iv)
  }, [fetchHealth])

  const formatTime = (iso: string | null) => {
    if (!iso) return '—'
    const d = new Date(iso)
    const now = new Date()
    const diffMin = Math.round((now.getTime() - d.getTime()) / 60000)
    if (diffMin < 1) return 'Justo ahora'
    if (diffMin < 60) return `Hace ${diffMin}m`
    if (diffMin < 1440) return `Hace ${Math.floor(diffMin / 60)}h`
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#D4A745]" />
            Estado del Sistema
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lastRefresh ? `Última actualización: ${lastRefresh.toLocaleTimeString('es-AR')}` : 'Cargando...'}
            {' · Auto-refresh 30s'}
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Connection Error */}
      {error && !data && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Scraper no disponible</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Overall Status Banner */}
          <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
            data.status === 'ok' ? 'bg-green-50 border border-green-200' :
            data.status === 'degraded' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            {data.status === 'ok' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
             data.status === 'degraded' ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> :
             <XCircle className="w-5 h-5 text-red-600" />}
            <span className={`font-semibold ${
              data.status === 'ok' ? 'text-green-800' :
              data.status === 'degraded' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {data.status === 'ok' ? 'Todos los sistemas operativos' :
               data.status === 'degraded' ? 'Sistema degradado' : 'Error en el sistema'}
            </span>
            <span className="ml-auto text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Uptime: {data.uptime_human}
            </span>
          </div>

          {/* Service Checks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <ServiceCard
              icon={Server} label="Scraper" ok={true}
              detail={`Up ${data.uptime_human}`}
            />
            <ServiceCard
              icon={Database} label="Supabase" ok={data.checks.supabase.status === 'ok'}
              detail={data.checks.supabase.status === 'ok' ? `${data.checks.supabase.latency_ms}ms` : data.checks.supabase.error || 'Error'}
            />
            <ServiceCard
              icon={Brain} label="OpenAI" ok={data.checks.openai_configured}
              detail={data.checks.openai_configured ? 'Configurado' : 'Sin API key'}
            />
            <ServiceCard
              icon={Zap} label="Apify" ok={data.checks.apify_configured}
              detail={data.checks.apify_configured ? 'Configurado' : 'Sin token'}
            />
          </div>

          {/* Stats Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Estadísticas de hoy</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatItem label="Tasaciones Express" value={data.stats.estimates_today} />
              <StatItem label="Tasaciones Formales" value={data.stats.formal_estimates_today} />
              <StatItem label="Análisis Target" value={data.stats.target_analyses_today} />
              <StatItem label="Errores 24h" value={data.stats.errors_last_24h} warn={data.stats.errors_last_24h > 0} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-600">
              <span>Última tasación: <strong>{formatTime(data.stats.last_estimate_at)}</strong></span>
              {data.stats.last_error && (
                <span className="text-red-600">Último error: {data.stats.last_error}</span>
              )}
            </div>
          </div>

          {/* Memory */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Memoria</h2>
            <div className="space-y-3">
              <MemoryBar label="RSS" valueMb={data.memory.rss_mb} maxMb={512} />
              <MemoryBar label="Heap" valueMb={data.memory.heap_used_mb} maxMb={256} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const ServiceCard = ({ icon: Icon, label, ok, detail }: { icon: React.ElementType; label: string; ok: boolean; detail: string }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2">
    <div className="flex items-center gap-2">
      <StatusDot ok={ok} />
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <span className="font-semibold text-sm text-gray-800">{label}</span>
    <span className={`text-xs ${ok ? 'text-gray-500' : 'text-red-500'}`}>{detail}</span>
  </div>
)

const StatItem = ({ label, value, warn }: { label: string; value: number; warn?: boolean }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    <div className="text-xs text-gray-500 mt-1">{label}</div>
  </div>
)

const MemoryBar = ({ label, valueMb, maxMb }: { label: string; valueMb: number; maxMb: number }) => {
  const pct = Math.min(100, Math.round((valueMb / maxMb) * 100))
  const color = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-[#D4A745]'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800">{valueMb} MB</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

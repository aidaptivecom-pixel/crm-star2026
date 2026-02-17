import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LogIn, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'

export const Login = () => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Password reset state
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError('Email o contraseña incorrectos')
    }
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setResetError(null)
    setResetLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setResetError('No se pudo enviar el email. Verificá la dirección.')
    } else {
      setResetSent(true)
    }
    setResetLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4A745]/8 via-transparent to-[#D4A745]/5" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(212,167,69,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,167,69,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo-star-text.png"
            alt="Star Real Estate"
            className="h-20 mx-auto mb-4"
            style={{ filter: 'brightness(1.3) saturate(0.85) sepia(0.15)' }}
          />
          <p className="text-gray-400 text-sm tracking-widest uppercase">
            {showReset ? 'Recuperar contraseña' : 'Panel de gestión'}
          </p>
        </div>

        {/* Reset Password Form */}
        {showReset ? (
          <div className="bg-[#13131d] border border-[#232336] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#D4A745]/10 rounded-full mb-2">
                  <Mail className="w-6 h-6 text-[#D4A745]" />
                </div>
                <h3 className="text-white font-medium">Email enviado</h3>
                <p className="text-gray-400 text-sm">
                  Revisá tu bandeja de entrada en <strong className="text-gray-300">{resetEmail}</strong> y seguí las instrucciones para restablecer tu contraseña.
                </p>
                <button
                  onClick={() => { setShowReset(false); setResetSent(false); setResetEmail('') }}
                  className="text-[#D4A745] text-sm hover:text-[#e0b84d] transition-colors"
                >
                  ← Volver al login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                {resetError && (
                  <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
                    {resetError}
                  </div>
                )}

                <p className="text-gray-400 text-sm">
                  Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 bg-[#0d0d14] border border-[#232336] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4A745]/40 focus:border-[#D4A745]/60 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4A745] text-black rounded-xl font-medium hover:bg-[#e0b84d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resetLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar enlace
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setShowReset(false); setResetError(null) }}
                  className="w-full flex items-center justify-center gap-1.5 text-gray-500 text-sm hover:text-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Volver al login
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="bg-[#13131d] border border-[#232336] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-2.5 bg-[#0d0d14] border border-[#232336] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4A745]/40 focus:border-[#D4A745]/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 bg-[#0d0d14] border border-[#232336] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4A745]/40 focus:border-[#D4A745]/60 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-colors ${
                    rememberMe 
                      ? 'bg-[#D4A745] border-[#D4A745]' 
                      : 'border-[#333348] bg-[#0d0d14] group-hover:border-[#3a3a4a]'
                  }`}>
                    {rememberMe && (
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                  Mantener sesión
                </span>
              </label>

              <button
                type="button"
                onClick={() => { setShowReset(true); setResetEmail(email) }}
                className="text-sm text-[#D4A745]/70 hover:text-[#D4A745] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4A745] text-black rounded-xl font-semibold hover:bg-[#e0b84d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Ingresar
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-xs mt-6 tracking-wider">
          STAR REAL ESTATE © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

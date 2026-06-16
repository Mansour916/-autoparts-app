import { useState } from 'react'
import { authAPI } from '../services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    if (!email || !password) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await authAPI.login({ email, password })
      localStorage.setItem('token', response.data.access_token)
      window.location.href = '/'
    } catch (err) {
      setError('Email ou mot de passe incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-ev-dark flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <span className="text-2xl">⚡</span>
            <span className="font-display text-xl font-bold text-white">AutoParts EV</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            La référence des pièces<br />
            <span className="text-ev-blue">VE & Hybrides</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Compatibilité garantie, support expert, et retour gratuit sous 30 jours.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '100%', label: 'Compatible' },
            { value: '30j', label: 'Retour gratuit' },
            { value: '24/7', label: 'Support expert' },
          ].map(item => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-ev-green">{item.value}</p>
              <p className="text-slate-400 text-xs mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">⚡</span>
            <span className="font-display text-xl font-bold text-slate-900">AutoParts EV</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Connexion</h1>
          <p className="text-slate-500 mb-8">Accédez à votre compte pour commander vos pièces</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-ev-blue/20 mt-6"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="text-center text-slate-500 text-sm mt-6">
            Pas encore de compte ?{' '}
            <span
              onClick={() => window.location.href = '/register'}
              className="text-ev-blue font-bold cursor-pointer hover:underline"
            >
              Créer un compte
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
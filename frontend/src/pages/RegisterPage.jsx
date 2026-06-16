import { useState } from 'react'
import { authAPI } from '../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.full_name) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await authAPI.register(form)
      const response = await authAPI.login({ email: form.email, password: form.password })
      localStorage.setItem('token', response.data.access_token)
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du compte')
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
            Rejoignez la communauté<br />
            <span className="text-ev-blue">VE & Hybrides</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Accédez à notre catalogue de pièces certifiées, gérez votre garage virtuel et suivez votre entretien.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { icon: '✅', text: 'Compatibilité 100% garantie par VIN' },
            { icon: '🚗', text: 'Garage virtuel multi-véhicules' },
            { icon: '🔧', text: 'Carnet d\'entretien intelligent' },
            { icon: '↩️', text: 'Retour gratuit sous 30 jours' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
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

          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Créer un compte</h1>
          <p className="text-slate-500 mb-8">Rejoignez AutoParts EV en quelques secondes</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                placeholder="Prénom Nom"
                value={form.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Téléphone <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="77 123 45 67"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-4 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-ev-blue/20 mt-6"
          >
            {isLoading ? 'Création...' : 'Créer mon compte'}
          </button>

          <p className="text-center text-slate-500 text-sm mt-6">
            Déjà un compte ?{' '}
            <span
              onClick={() => window.location.href = '/login'}
              className="text-ev-blue font-bold cursor-pointer hover:underline"
            >
              Se connecter
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
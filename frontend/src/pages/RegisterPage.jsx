import { useState } from 'react'
import { authAPI } from '../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '', role: 'user',
    store_name: '', store_address: '', store_latitude: '', store_longitude: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.full_name) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (form.role === 'seller' && (!form.store_name || !form.store_address)) {
      setError('Veuillez indiquer le nom et l adresse de votre magasin')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const payload = {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone: form.phone,
        role: form.role
      }
      if (form.role === 'seller') {
        payload.store_name = form.store_name
        payload.store_address = form.store_address
        payload.store_latitude = form.store_latitude ? parseFloat(form.store_latitude) : null
        payload.store_longitude = form.store_longitude ? parseFloat(form.store_longitude) : null
      }
      await authAPI.register(payload)
      const response = await authAPI.login({ email: form.email, password: form.password })
      localStorage.setItem('token', response.data.access_token)
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la creation du compte')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-ev-dark flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <span className="text-2xl">⚡</span>
            <span className="font-display text-xl font-bold text-white">AutoParts EV</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Rejoignez la communaute<br />
            <span className="text-ev-blue">VE & Hybrides</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Acheteur ou vendeur, trouvez votre place sur la plateforme de reference des pieces VE.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { icon: '✅', text: 'Compatibilite 100% garantie par VIN' },
            { icon: '🚗', text: 'Garage virtuel multi-vehicules' },
            { icon: '🏬', text: 'Devenez vendeur et gerez votre boutique' },
            { icon: '↩️', text: 'Retour gratuit sous 30 jours' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="text-lg">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">⚡</span>
            <span className="font-display text-xl font-bold text-slate-900">AutoParts EV</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Creer un compte</h1>
          <p className="text-slate-500 mb-6">Rejoignez AutoParts EV en quelques secondes</p>

          <p className="text-sm font-semibold text-slate-700 mb-2">Je suis...</p>
          <div className="flex gap-2 mb-6 bg-slate-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'user' })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                form.role === 'user' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              🚗 Acheteur
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'seller' })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                form.role === 'seller' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              🏬 Vendeur
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                placeholder="Prenom Nom"
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
                Telephone <span className="text-slate-400 font-normal">(optionnel)</span>
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

            {form.role === 'seller' && (
              <div className="bg-ev-blue/5 border border-ev-blue/20 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-ev-blue uppercase tracking-wide">Informations du magasin</p>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nom du magasin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="store_name"
                    placeholder="Ex: AutoParts EV Dakar"
                    value={form.store_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="store_address"
                    placeholder="Adresse complete du magasin"
                    value={form.store_address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.0001"
                    name="store_latitude"
                    placeholder="Latitude"
                    value={form.store_latitude}
                    onChange={handleChange}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    name="store_longitude"
                    placeholder="Longitude"
                    value={form.store_longitude}
                    onChange={handleChange}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
                  />
                </div>
                <p className="text-slate-400 text-xs">
                  Latitude/longitude facultatives — vous pourrez les ajuster plus tard depuis votre tableau de bord.
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-4 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-ev-blue/20 mt-6"
          >
            {isLoading ? 'Creation...' : 'Creer mon compte'}
          </button>

          <p className="text-center text-slate-500 text-sm mt-6">
            Deja un compte ?{' '}
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
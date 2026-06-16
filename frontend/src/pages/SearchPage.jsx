import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { vehiclesAPI } from '../services/api'
import useVehicleStore from '../store/vehicleStore'

export default function SearchPage() {
  const [searchType, setSearchType] = useState('vin')
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const { setSelectedVehicle } = useVehicleStore()
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!searchValue.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const params = searchType === 'vin' ? { vin: searchValue } : { plate: searchValue }
      const response = await vehiclesAPI.lookup(params)
      setSelectedVehicle(response.data)
      navigate('/parts')
    } catch (err) {
      setError('Véhicule non trouvé. Vérifiez votre ' + (searchType === 'vin' ? 'VIN' : 'plaque'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <div className="bg-ev-dark">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-ev-green/10 border border-ev-green/20 text-ev-green text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-ev-green animate-pulse"></span>
            Spécialiste Pièces VE & Hybrides
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4 leading-tight">
            La bonne pièce,<br />
            <span className="text-ev-blue">garantie compatible</span>
          </h1>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
            Entrez votre VIN ou plaque d'immatriculation pour trouver instantanément toutes les pièces compatibles avec votre véhicule.
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl">
            {/* Toggle */}
            <div className="flex gap-2 mb-4 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setSearchType('vin')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  searchType === 'vin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Numéro VIN
              </button>
              <button
                onClick={() => setSearchType('plate')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  searchType === 'plate'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Plaque d'immatriculation
              </button>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder={searchType === 'vin' ? 'Ex: VF1RFD00X56789012' : 'Ex: DK-1234-AB'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all font-mono text-sm"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-8 py-3.5 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-ev-blue/25 whitespace-nowrap"
              >
                {isLoading ? '...' : 'Rechercher'}
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-sm mt-3 text-center bg-red-50 border border-red-200 rounded-lg py-2">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600 font-medium">
          <span className="flex items-center gap-2">✅ Compatibilité 100% garantie</span>
          <span className="flex items-center gap-2">🚚 Livraison rapide</span>
          <span className="flex items-center gap-2">↩️ Retour gratuit 30 jours</span>
          <span className="flex items-center gap-2">🔧 Support expert VE/Hybride</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-slate-900 mb-6 text-center">
          Parcourir par catégorie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔋', label: 'Batteries', desc: 'Pack & cellules' },
            { icon: '❄️', label: 'Refroidissement', desc: 'Circuit thermique' },
            { icon: '⚡', label: 'Électronique', desc: 'Modules & capteurs' },
            { icon: '🛑', label: 'Freins', desc: 'Plaquettes & disques' },
            { icon: '⚙️', label: 'Moteur', desc: 'Pièces moteur' },
            { icon: '🔧', label: 'Suspension', desc: 'Amortisseurs' },
            { icon: '🧰', label: 'Filtres', desc: 'Habitacle & air' },
            { icon: '🛞', label: 'Pneus', desc: 'Spécial VE' },
          ].map((cat) => (
            <button
              key={cat.label}
              onClick={() => navigate('/parts')}
              className="bg-white border-2 border-slate-200 hover:border-ev-blue hover:shadow-md rounded-2xl p-5 text-left transition-all group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="font-semibold text-slate-900 text-sm group-hover:text-ev-blue transition-colors">{cat.label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Garage CTA */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-ev-dark rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-2">
              🚗 Accédez à votre garage virtuel
            </h3>
            <p className="text-slate-300 text-sm">
              Enregistrez vos véhicules, suivez l'entretien, et retrouvez vos pièces en un clic.
            </p>
          </div>
          <button
            onClick={() => navigate('/garage')}
            className="px-8 py-3.5 bg-ev-blue hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg whitespace-nowrap"
          >
            Mon Garage →
          </button>
        </div>
      </div>
    </div>
  )
}
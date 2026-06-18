import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { partsAPI, BASE_URL } from '../services/api'
import useVehicleStore from '../store/vehicleStore'
import useCartStore from '../store/cartStore'

export default function PartsPage() {
  const [parts, setParts] = useState([])
  const [filteredParts, setFilteredParts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [compareData, setCompareData] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  const { selectedVehicle } = useVehicleStore()
  const { addItem, items } = useCartStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state && location.state.category) {
      setActiveCategory(location.state.category)
    }
  }, [location.state])

  useEffect(() => {
    if (!selectedVehicle) { navigate('/'); return }
    loadParts()
  }, [selectedVehicle])

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredParts(parts)
    } else {
      setFilteredParts(parts.filter(p => p.category === activeCategory))
    }
  }, [activeCategory, parts])

  const loadParts = async () => {
    try {
      const response = await partsAPI.list({ vehicle_id: selectedVehicle.id })
      setParts(response.data)
      setFilteredParts(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompare = async (oemRef) => {
    setCompareLoading(true)
    setCompareData({ oemRef, results: [] })
    try {
      const response = await partsAPI.compare(oemRef, selectedVehicle.id)
      setCompareData({ oemRef, results: response.data })
    } catch (err) {
      setCompareData(null)
    } finally {
      setCompareLoading(false)
    }
  }

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const categoryIcons = {
    battery: '🔋', motor: '⚙️', brakes: '🛑',
    cooling: '❄️', suspension: '🔧', electronics: '⚡',
    filters: '🧰', tires: '🛞', other: '📦'
  }

  const categoryLabels = {
    battery: 'Batteries', motor: 'Moteur', brakes: 'Freins',
    cooling: 'Refroidissement', suspension: 'Suspension', electronics: 'Électronique',
    filters: 'Filtres', tires: 'Pneus', other: 'Autre'
  }

  const categories = ['all', ...new Set(parts.map(p => p.category))]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-ev-dark">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm mb-2 transition-colors flex items-center gap-1">
              ← Retour à la recherche
            </button>
            <h1 className="font-display text-2xl font-bold text-white">Pièces compatibles</h1>
            {selectedVehicle && (
              <div className="inline-flex items-center gap-2 mt-2 bg-ev-green/15 border border-ev-green/30 text-ev-green px-3 py-1.5 rounded-full text-sm font-semibold">
                ✅ {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/diagram')} className="border border-white/20 text-slate-200 hover:text-white hover:border-white/40 hover:bg-white/5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all">
              🔋 Schéma éclaté
            </button>
            <button onClick={() => navigate('/cart')} className="relative bg-ev-blue hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg">
              🛒 Panier
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-ev-green text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filtres catégories */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-ev-blue text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? `Toutes (${parts.length})` : `${categoryIcons[cat]} ${categoryLabels[cat]}`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center text-slate-500 py-20">Chargement des pièces...</div>
        ) : filteredParts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-600 font-medium">Aucune pièce trouvée dans cette catégorie.</p>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-5">{filteredParts.length} pièce(s) compatible(s) trouvée(s)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredParts.map(part => (
                <div key={part.id} className="bg-white rounded-2xl border border-slate-200 hover:border-ev-blue/40 hover:shadow-xl transition-all overflow-hidden group">
                  {/* Image */}
                  <div onClick={() => navigate(`/parts/${part.id}`)} className="relative h-44 bg-slate-100 flex items-center justify-center cursor-pointer overflow-hidden">
                    {part.image_url ? (
                      <img src={`${BASE_URL}${part.image_url}`} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="text-6xl opacity-20">{categoryIcons[part.category] || '📦'}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-3 left-3 bg-ev-green text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      ✅ Compatible
                    </span>
                    <span className="absolute top-3 right-3 bg-white/90 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {categoryIcons[part.category]} {categoryLabels[part.category]}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 onClick={() => navigate(`/parts/${part.id}`)} className="font-display font-bold text-slate-900 mb-1 cursor-pointer hover:text-ev-blue transition-colors leading-snug">
                      {part.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-mono mb-1">{part.brand} · Réf. {part.oem_reference}</p>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">{part.description}</p>

                    <div className="flex items-center justify-between mb-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="font-display text-2xl font-bold text-slate-900">{part.price.toFixed(2)} €</span>
                        {part.warranty_months && (
                          <p className="text-slate-400 text-xs mt-0.5">Garantie {part.warranty_months} mois</p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        part.stock > 0
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {part.stock > 0 ? `En stock (${part.stock})` : 'Rupture'}
                      </span>
                    </div>

                    <button
                      onClick={() => addItem(part)}
                      disabled={part.stock === 0}
                      className="w-full py-3 bg-ev-blue hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold transition-all mb-2 shadow-sm"
                    >
                      {part.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
                    </button>

                    {part.oem_reference && (
                      <button
                        onClick={() => handleCompare(part.oem_reference)}
                        className="w-full py-2 border-2 border-slate-200 text-slate-600 hover:text-ev-blue hover:border-ev-blue/40 rounded-xl text-sm font-semibold transition-all"
                      >
                        ⚖️ Comparer les marques
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Comparateur */}
      {compareData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setCompareData(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">⚖️ Comparateur de marques</h3>
                <p className="text-slate-400 text-xs font-mono mt-0.5">OEM {compareData.oemRef}</p>
              </div>
              <button onClick={() => setCompareData(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">✕</button>
            </div>

            {compareLoading ? (
              <p className="text-center text-slate-500 py-8">Chargement...</p>
            ) : (
              <div className="space-y-3">
                {compareData.results.map((item, idx) => (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                    idx === 0 ? 'border-ev-green/40 bg-ev-green/5' : 'border-slate-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{item.brand}</span>
                        {idx === 0 && <span className="bg-ev-green text-white text-xs font-bold px-2 py-0.5 rounded-full">Meilleur prix</span>}
                      </div>
                      <p className="text-slate-500 text-xs mb-2">{item.description}</p>
                      <div className="flex gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="font-medium">Garantie : {item.warranty_months} mois</span>
                        {item.certification && <span>· {item.certification}</span>}
                        <span className={`font-semibold ${item.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          · {item.stock > 0 ? `En stock (${item.stock})` : 'Rupture'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-display text-xl font-bold text-slate-900 mb-2">{item.price.toFixed(2)} €</p>
                      <button
                        onClick={() => { addItem({ ...item }); setCompareData(null) }}
                        disabled={item.stock === 0}
                        className="px-4 py-2 bg-ev-blue hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-bold transition-all"
                      >
                        Choisir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { partsAPI } from '../services/api'
import useVehicleStore from '../store/vehicleStore'
import useCartStore from '../store/cartStore'

const COOLING_PARTS_MAP = {
  "Plaque de refroidissement batterie": { x: 140, y: 170, w: 240, h: 50, color: "teal" },
  "Radiateur de refroidissement": { x: 460, y: 70, w: 150, h: 60, color: "coral" },
  "Pompe electrique de circulation": { x: 460, y: 250, w: 150, h: 60, color: "blue" },
  "Reservoir liquide de refroidissement": { x: 180, y: 320, w: 280, h: 60, color: "teal" },
  "Capteur de temperature batterie": { x: 160, y: 240, w: 200, h: 50, color: "amber" }
}

export default function DiagramPage() {
  const [parts, setParts] = useState([])
  const [selectedPart, setSelectedPart] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const { selectedVehicle } = useVehicleStore()
  const { addItem } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!selectedVehicle) {
      navigate('/')
      return
    }
    loadParts()
  }, [selectedVehicle])

  const loadParts = async () => {
    try {
      const response = await partsAPI.list({ vehicle_id: selectedVehicle.id })
      const coolingParts = response.data.filter(p =>
        Object.keys(COOLING_PARTS_MAP).some(key =>
          p.name.toLowerCase().includes(key.toLowerCase().slice(0, 15))
        )
      )
      setParts(coolingParts.length > 0 ? coolingParts : response.data.filter(p => p.category === 'cooling'))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getPosition = (partName) => {
    for (const [key, pos] of Object.entries(COOLING_PARTS_MAP)) {
      if (partName.toLowerCase().includes(key.toLowerCase().slice(0, 15))) return pos
    }
    return null
  }

  const colorClasses = {
    teal: 'fill-ev-green/10 stroke-ev-green',
    coral: 'fill-red-500/10 stroke-red-400',
    blue: 'fill-ev-blue/10 stroke-ev-blue',
    amber: 'fill-ev-amber/10 stroke-ev-amber'
  }

  const textColorClasses = {
    teal: 'fill-ev-green',
    coral: 'fill-red-500',
    blue: 'fill-ev-blue',
    amber: 'fill-ev-amber'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ev-dark border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/parts')}
            className="text-slate-400 hover:text-white text-sm mb-2 transition-colors"
          >
            ← Retour au catalogue
          </button>
          <h1 className="font-display text-2xl font-semibold text-white">
            🔋 Schéma — Système de refroidissement batterie
          </h1>
          {selectedVehicle && (
            <div className="inline-flex items-center gap-2 mt-2 bg-ev-green/10 border border-ev-green/30 text-ev-green px-3 py-1.5 rounded-full text-sm font-medium">
              ✅ {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diagramme */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          {isLoading ? (
            <p className="text-center text-slate-500 py-20">Chargement du schéma...</p>
          ) : (
            <svg viewBox="0 0 680 400" className="w-full h-auto">
              {/* Pack batterie container */}
              <rect x="120" y="60" width="280" height="180" rx="12" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              <text x="260" y="40" textAnchor="middle" className="fill-slate-500 text-sm font-medium">Pack batterie</text>

              {/* Cellules (non cliquable, structurel) */}
              <rect x="140" y="100" width="240" height="60" rx="8" className="fill-slate-100 stroke-slate-300" strokeWidth="0.5" />
              <text x="260" y="125" textAnchor="middle" className="fill-slate-600 text-sm font-medium">Cellules de batterie</text>
              <text x="260" y="143" textAnchor="middle" className="fill-slate-400 text-xs">52 kWh</text>

              {/* Pièces cliquables */}
              {parts.map(part => {
                const pos = getPosition(part.name)
                if (!pos) return null
                const isSelected = selectedPart?.id === part.id
                return (
                  <g
                    key={part.id}
                    onClick={() => setSelectedPart(part)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx="8"
                      className={`${colorClasses[pos.color]} transition-all`}
                      strokeWidth={isSelected ? "2" : "0.5"}
                    />
                    <text x={pos.x + pos.w/2} y={pos.y + pos.h/2 - 6} textAnchor="middle" className={`${textColorClasses[pos.color]} text-sm font-semibold`}>
                      {part.name.length > 35 ? part.name.slice(0, 32) + '...' : part.name}
                    </text>
                    <text x={pos.x + pos.w/2} y={pos.y + pos.h/2 + 12} textAnchor="middle" className="fill-slate-500 text-xs">
                      {part.price.toFixed(2)} € · clic pour détails
                    </text>
                  </g>
                )
              })}

              {/* Tuyaux décoratifs */}
              <path d="M380 195 L460 195 L460 130" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M460 100 L440 100 L440 280 L460 280" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M460 280 L320 280 L320 320" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M180 350 L100 350 L100 195 L138 195" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
          )}

          <p className="text-center text-slate-400 text-xs mt-4">
            Cliquez sur une pièce du schéma pour voir les détails et l'ajouter au panier
          </p>
        </div>

        {/* Détails pièce sélectionnée */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {selectedPart ? (
            <>
              <span className="inline-flex items-center gap-1 bg-ev-green/10 text-ev-green text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
                ✅ Compatible
              </span>
              <h3 className="font-display font-semibold text-lg text-slate-900 mb-1">
                {selectedPart.name}
              </h3>
              <p className="text-slate-400 text-xs font-mono mb-3">
                {selectedPart.brand} · OEM {selectedPart.oem_reference}
              </p>
              <p className="text-slate-600 text-sm mb-4">
                {selectedPart.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-2xl font-bold text-slate-900">
                  {selectedPart.price.toFixed(2)} €
                </span>
                <span className={`text-xs font-medium ${selectedPart.stock > 0 ? 'text-ev-green' : 'text-red-500'}`}>
                  {selectedPart.stock > 0 ? `✅ En stock (${selectedPart.stock})` : '❌ Rupture'}
                </span>
              </div>
              <button
                onClick={() => addItem(selectedPart)}
                disabled={selectedPart.stock === 0}
                className="w-full py-3 bg-ev-blue hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-semibold transition-all"
              >
                Ajouter au panier
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-slate-400 text-sm">
                Sélectionnez une pièce sur le schéma pour voir ses détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
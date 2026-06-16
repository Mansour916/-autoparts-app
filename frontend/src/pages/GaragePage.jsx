import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { garageAPI } from '../services/api'
import useVehicleStore from '../store/vehicleStore'

export default function GaragePage() {
  const [vehicles, setVehicles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [mileageInput, setMileageInput] = useState('')

  const { setSelectedVehicle } = useVehicleStore()
  const navigate = useNavigate()

  useEffect(() => { loadGarage() }, [])

  const loadGarage = async () => {
    try {
      const response = await garageAPI.list()
      setVehicles(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (garageId) => {
    try {
      await garageAPI.remove(garageId)
      setVehicles(vehicles.filter(v => v.garage_id !== garageId))
    } catch (err) { console.error(err) }
  }

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle({
      id: vehicle.vehicle_id, brand: vehicle.brand, model: vehicle.model,
      year: vehicle.year, vin: vehicle.vin, plate: vehicle.plate, fuel_type: vehicle.fuel_type
    })
    navigate('/parts')
  }

  const saveMileage = async (garageId) => {
    try {
      await garageAPI.updateMileage(garageId, { mileage: parseInt(mileageInput) })
      setVehicles(vehicles.map(v => v.garage_id === garageId ? { ...v, mileage: parseInt(mileageInput) } : v))
      setEditingId(null)
    } catch (err) { console.error(err) }
  }

  const fuelConfig = {
    electric: { label: '⚡ Électrique', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    hybrid: { label: '🔋 Hybride', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    thermal: { label: '⛽ Thermique', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-ev-dark">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm mb-2 transition-colors">← Retour</button>
            <h1 className="font-display text-2xl font-bold text-white">🚗 Mon Garage</h1>
            <p className="text-slate-400 text-sm mt-1">{vehicles.length} véhicule(s) enregistré(s)</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-ev-blue hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            + Ajouter un véhicule
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center text-slate-500 py-20">Chargement...</div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-20 shadow-sm">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-slate-600 font-semibold text-lg mb-2">Aucun véhicule dans votre garage</p>
            <p className="text-slate-400 text-sm mb-6">Ajoutez votre premier véhicule en recherchant par VIN ou plaque</p>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-ev-blue hover:bg-blue-700 text-white rounded-xl font-bold transition-all">
              Rechercher un véhicule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map(vehicle => {
              const fuel = fuelConfig[vehicle.fuel_type] || { label: vehicle.fuel_type, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
              return (
                <div key={vehicle.garage_id} className="bg-white rounded-2xl border border-slate-200 hover:border-ev-blue/40 hover:shadow-lg transition-all overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-ev-dark to-ev-slate p-5">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${fuel.bg} ${fuel.text} ${fuel.border} mb-3`}>
                      {fuel.label}
                    </span>
                    <h3 className="font-display font-bold text-xl text-white">
                      {vehicle.nickname || `${vehicle.brand} ${vehicle.model}`}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{vehicle.brand} {vehicle.model} · {vehicle.year}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-400 text-xs font-medium mb-1">Plaque</p>
                        <p className="font-bold text-slate-900 font-mono text-sm">{vehicle.plate || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-slate-400 text-xs font-medium mb-1">Kilométrage</p>
                        {editingId === vehicle.garage_id ? (
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={mileageInput}
                              onChange={(e) => setMileageInput(e.target.value)}
                              className="w-16 px-2 py-0.5 border border-slate-200 rounded-lg text-xs"
                            />
                            <button onClick={() => saveMileage(vehicle.garage_id)} className="bg-ev-green text-white rounded-lg px-2 text-xs font-bold">✓</button>
                          </div>
                        ) : (
                          <p
                            onClick={() => { setEditingId(vehicle.garage_id); setMileageInput(vehicle.mileage.toString()) }}
                            className="font-bold text-slate-900 text-sm cursor-pointer hover:text-ev-blue transition-colors"
                          >
                            {vehicle.mileage.toLocaleString()} km ✏️
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectVehicle(vehicle)}
                        className="w-full py-3 bg-ev-blue hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all"
                      >
                        Voir les pièces compatibles
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/maintenance/${vehicle.garage_id}`)}
                          className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 hover:border-ev-blue/40 hover:text-ev-blue rounded-xl text-sm font-semibold transition-all"
                        >
                          🔧 Entretien
                        </button>
                        <button
                          onClick={() => handleRemove(vehicle.garage_id)}
                          className="py-2.5 px-4 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
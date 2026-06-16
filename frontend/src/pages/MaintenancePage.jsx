import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { maintenanceAPI, garageAPI } from '../services/api'

export default function MaintenancePage() {
  const { garageId } = useParams()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState(null)
  const [data, setData] = useState(null)
  const [intervals, setIntervals] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [description, setDescription] = useState('')
  const [mileage, setMileage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => { loadData() }, [garageId])

  const loadData = async () => {
    try {
      const [historyRes, intervalsRes, garageRes] = await Promise.all([
        maintenanceAPI.getHistory(garageId),
        maintenanceAPI.getIntervals(),
        garageAPI.list()
      ])
      setData(historyRes.data)
      setIntervals(intervalsRes.data)
      setMileage(historyRes.data.current_mileage.toString())
      const v = garageRes.data.find(v => v.garage_id === garageId)
      setVehicle(v)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLog = async () => {
    if (!description || !mileage) { setError('Remplissez tous les champs'); return }
    setIsSubmitting(true)
    setError(null)
    try {
      await maintenanceAPI.add({ garage_vehicle_id: garageId, description, mileage: parseInt(mileage) })
      setDescription('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      await loadData()
    } catch (err) {
      setError("Erreur lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ev-dark">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/garage')} className="text-slate-400 hover:text-white text-sm mb-2 transition-colors">← Retour au garage</button>
          <h1 className="font-display text-2xl font-bold text-white">🔧 Carnet d'entretien</h1>
          {vehicle && (
            <p className="text-slate-300 text-sm mt-1">
              {vehicle.nickname || `${vehicle.brand} ${vehicle.model}`} ·
              <span className="text-ev-blue font-semibold"> {data?.current_mileage?.toLocaleString()} km</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Alertes */}
        {data?.alerts?.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-slate-900">⚠️ Alertes maintenance</h2>
            {data.alerts.map((alert, idx) => (
              <div key={idx} className={`rounded-2xl p-5 border-2 flex items-start gap-4 ${
                alert.urgent
                  ? 'bg-red-50 border-red-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <span className="text-2xl flex-shrink-0">{alert.urgent ? '🚨' : '⚠️'}</span>
                <div>
                  <p className={`font-bold text-base ${alert.urgent ? 'text-red-700' : 'text-yellow-700'}`}>
                    {alert.description}
                  </p>
                  <p className={`text-sm mt-1 ${alert.urgent ? 'text-red-600' : 'text-yellow-600'}`}>
                    {alert.urgent
                      ? `Dépassé de ${Math.abs(alert.remaining_km).toLocaleString()} km — intervention recommandée`
                      : `Dans ${alert.remaining_km.toLocaleString()} km (à ${alert.next_service_mileage.toLocaleString()} km)`
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-bold text-slate-900 mb-4">Ajouter un entretien</h2>

          <select
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 text-sm mb-3 focus:outline-none focus:border-ev-blue transition-all"
          >
            <option value="">Sélectionner un type d'entretien...</option>
            {Object.keys(intervals).map(key => (
              <option key={key} value={key}>{key} (tous les {intervals[key].toLocaleString()} km)</option>
            ))}
            <option value="Autre">Autre intervention</option>
          </select>

          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Kilométrage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="flex-1 px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-ev-blue transition-all"
            />
            <button
              onClick={handleAddLog}
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-sm"
            >
              {isSubmitting ? '...' : 'Enregistrer'}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm mt-3 bg-red-50 border border-red-200 rounded-lg p-2 text-center">{error}</p>}
          {success && <p className="text-green-700 text-sm mt-3 bg-green-50 border border-green-200 rounded-lg p-2 text-center">✅ Entretien enregistré avec succès</p>}
        </div>

        {/* Historique */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-bold text-slate-900 mb-6">Historique des entretiens</h2>

          {data?.history?.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-500 text-sm">Aucun entretien enregistré pour le moment</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              <div className="space-y-6">
                {data?.history?.map((log, idx) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-ev-blue flex items-center justify-center flex-shrink-0 z-10 shadow-md">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900">{log.description}</p>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(log.created_at)}</span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">
                        🔢 {log.mileage_at_service.toLocaleString()} km
                      </p>
                      {log.next_service_mileage && (
                        <p className="text-ev-blue text-xs mt-2 font-semibold">
                          Prochain entretien à {log.next_service_mileage.toLocaleString()} km
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
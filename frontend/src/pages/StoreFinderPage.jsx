import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STORES = [
  { id: 1, name: "AutoParts EV — Dakar Centre", address: "12 Avenue Cheikh Anta Diop, Dakar", phone: "+221331234567", hours: "Lun-Sam 8h-19h, Dim 9h-17h", lat: 14.6937, lng: -17.4441, services: ["Batterie", "Diagnostic", "Retours"] },
  { id: 2, name: "AutoParts EV — Plateau", address: "45 Rue Carnot, Plateau, Dakar", phone: "+221332345678", hours: "Lun-Sam 8h-19h", lat: 14.6750, lng: -17.4430, services: ["Batterie", "Diagnostic"] },
  { id: 3, name: "AutoParts EV — Almadies", address: "Route des Almadies, Dakar", phone: "+221333456789", hours: "Lun-Sam 8h-18h", lat: 14.7300, lng: -17.5100, services: ["Batterie", "Retours"] },
  { id: 4, name: "AutoParts EV — Thies", address: "Boulevard du General de Gaulle, Thies", phone: "+221334567890", hours: "Lun-Sam 8h-18h", lat: 14.7910, lng: -16.9260, services: ["Batterie"] },
  { id: 5, name: "AutoParts EV — Saint-Louis", address: "Rue Khalil Mahmoud, Saint-Louis", phone: "+221335678901", hours: "Lun-Sam 8h-17h", lat: 16.0326, lng: -16.4818, services: ["Batterie", "Diagnostic"] },
]

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function StoreFinderPage() {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState(null)
  const [stores, setStores] = useState(STORES)
  const [selectedStore, setSelectedStore] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [searchCity, setSearchCity] = useState('')

  const locateMe = () => {
    setIsLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        const sorted = [...STORES].map(s => ({
          ...s,
          distance: getDistance(latitude, longitude, s.lat, s.lng)
        })).sort((a, b) => a.distance - b.distance)
        setStores(sorted)
        setSelectedStore(sorted[0])
        setIsLocating(false)
      },
      () => {
        setLocationError("Impossible d'obtenir votre position. Activez la geolocalisation.")
        setIsLocating(false)
      }
    )
  }

  const handleSearch = () => {
    if (!searchCity.trim()) return
    const filtered = STORES.filter(s =>
      s.name.toLowerCase().includes(searchCity.toLowerCase()) ||
      s.address.toLowerCase().includes(searchCity.toLowerCase())
    )
    setStores(filtered.length > 0 ? filtered : STORES)
    if (filtered.length > 0) setSelectedStore(filtered[0])
  }

  useEffect(() => { locateMe() }, [])

  const mapsUrl = selectedStore
    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedStore.lat},${selectedStore.lng}`
    : '#'

  const phoneUrl = selectedStore ? `tel:${selectedStore.phone}` : '#'

  const mapSrc = selectedStore
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedStore.lng - 0.05},${selectedStore.lat - 0.05},${selectedStore.lng + 0.05},${selectedStore.lat + 0.05}&layer=mapnik&marker=${selectedStore.lat},${selectedStore.lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=-17.55,14.60,-17.35,14.80&layer=mapnik`

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ev-dark">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white text-sm mb-2 transition-colors"
          >
            Retour
          </button>
          <h1 className="font-display text-2xl font-bold text-white">Trouver un magasin</h1>
          <p className="text-slate-300 text-sm mt-1">
            Utilisez notre localisateur pour trouver un etablissement pres de chez vous
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ville, quartier ou adresse..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-ev-blue transition-all text-sm"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all"
            >
              Rechercher
            </button>
            <button
              onClick={locateMe}
              disabled={isLocating}
              className="px-6 py-3.5 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all whitespace-nowrap"
            >
              {isLocating ? 'Localisation...' : 'Me localiser'}
            </button>
          </div>
          {locationError && (
            <p className="text-red-600 text-sm mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
              {locationError}
            </p>
          )}
          {userLocation && (
            <p className="text-ev-green text-sm mt-3 font-semibold">
              Position detectee — magasins tries par distance
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3 max-h-96 overflow-y-auto pr-1">
            <p className="text-slate-500 text-sm font-medium">{stores.length} magasin(s)</p>
            {stores.map(store => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                  selectedStore && selectedStore.id === store.id
                    ? 'border-ev-blue shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-bold text-slate-900 text-sm leading-snug">
                    {store.name}
                  </h3>
                  {store.distance !== undefined && (
                    <span className="bg-ev-blue/10 text-ev-blue text-xs font-bold px-2.5 py-1 rounded-full ml-2">
                      {store.distance.toFixed(1)} km
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mb-1">{store.address}</p>
                <p className="text-slate-400 text-xs mb-3">{store.hours}</p>
                <div className="flex flex-wrap gap-1.5">
                  {store.services.map(s => (
                    <span
                      key={s}
                      className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <iframe
                src={mapSrc}
                width="100%"
                height="320"
                className="border-0"
                title="Carte magasin"
              />
            </div>

            {selectedStore && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900">
                      {selectedStore.name}
                    </h3>
                    {selectedStore.distance !== undefined && (
                      <p className="text-ev-blue text-sm font-semibold mt-0.5">
                        A {selectedStore.distance.toFixed(1)} km de vous
                      </p>
                    )}
                  </div>
                  <span className="bg-ev-green/10 text-ev-green text-xs font-bold px-3 py-1.5 rounded-full border border-ev-green/20">
                    Ouvert
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <p className="text-slate-700 text-sm">{selectedStore.address}</p>
                  <p className="text-slate-700 text-sm">{selectedStore.phone}</p>
                  <p className="text-slate-700 text-sm">{selectedStore.hours}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {selectedStore.services.map(s => (
                    <span
                      key={s}
                      className="bg-ev-blue/10 text-ev-blue text-sm font-semibold px-3 py-1.5 rounded-full border border-ev-blue/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center py-3 bg-ev-blue hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all"
                  >
                    Itineraire
                  </a>
                  
                    href={phoneUrl}
                    className="flex items-center justify-center py-3 border-2 border-slate-200 text-slate-700 hover:border-ev-blue hover:text-ev-blue rounded-xl font-bold text-sm transition-all"
                  >
                    Appeler
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
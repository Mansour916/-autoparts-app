import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { partsAPI, BASE_URL } from '../services/api'
import useVehicleStore from '../store/vehicleStore'
import useCartStore from '../store/cartStore'

export default function PartDetailPage() {
  const { partId } = useParams()
  const navigate = useNavigate()

  const [part, setPart] = useState(null)
  const [images, setImages] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const { selectedVehicle } = useVehicleStore()
  const { addItem } = useCartStore()

  useEffect(() => { loadData() }, [partId])

  const loadData = async () => {
    try {
      const [partRes, imagesRes] = await Promise.all([
        partsAPI.get(partId, selectedVehicle?.id),
        partsAPI.getImages(partId)
      ])
      setPart(partRes.data)
      setImages(imagesRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getYoutubeEmbed = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const categoryIcons = {
    battery: '🔋', motor: '⚙️', brakes: '🛑',
    cooling: '❄️', suspension: '🔧', electronics: '⚡',
    filters: '🧰', tires: '🛞', other: '📦'
  }

  const categoryLabels = {
    battery: 'Batterie', motor: 'Moteur', brakes: 'Freins',
    cooling: 'Refroidissement', suspension: 'Suspension', electronics: 'Électronique',
    filters: 'Filtres', tires: 'Pneus', other: 'Autre'
  }

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Chargement...</p>
    </div>
  )

  if (!part) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Pièce non trouvée</p>
    </div>
  )

  const videoEmbed = getYoutubeEmbed(part.video_url)
  const hasImages = images.length > 0
  const mainImage = hasImages ? images[activeImage]?.image_url : part.image_url

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-ev-dark">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/parts')} className="text-slate-400 hover:text-white text-sm mb-2 transition-colors">← Retour au catalogue</button>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-400 text-sm">{categoryIcons[part.category]} {categoryLabels[part.category]}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-sm font-mono">{part.brand}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mt-2">{part.name}</h1>
          {selectedVehicle && part.is_compatible !== undefined && (
            <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-bold border ${
              part.is_compatible
                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}>
              {part.is_compatible
                ? `✅ Compatible avec votre ${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year}`
                : `❌ Non compatible avec votre ${selectedVehicle.brand} ${selectedVehicle.model}`
              }
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galerie */}
        <div>
          {/* Image principale */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-3 shadow-sm">
            <div className="h-80 bg-slate-100 flex items-center justify-center">
              {mainImage ? (
                <img src={`${BASE_URL}${mainImage}`} alt={part.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-8xl opacity-10">{categoryIcons[part.category] || '📦'}</div>
              )}
            </div>
          </div>

          {/* Miniatures */}
          {hasImages && images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mb-6">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-ev-blue shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={`${BASE_URL}${img.image_url}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Vidéo tutoriel */}
          {videoEmbed && (
            <div>
              <h3 className="font-display font-bold text-slate-900 mb-3 flex items-center gap-2">
                🎥 Tutoriel de montage
              </h3>
              <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <iframe src={videoEmbed} title="Tutoriel de montage" className="w-full h-full" allowFullScreen />
              </div>
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <p className="text-yellow-800 text-xs font-medium">
                  Pour les véhicules électriques, coupez toujours l'alimentation haute tension avant toute intervention.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div className="space-y-4">
          {/* Prix et stock */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-display text-4xl font-bold text-slate-900">{part.price.toFixed(2)} €</span>
                {part.warranty_months && (
                  <p className="text-slate-400 text-sm mt-1">Garantie {part.warranty_months} mois</p>
                )}
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${
                part.stock > 0
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {part.stock > 0 ? `✅ En stock (${part.stock})` : '❌ Rupture'}
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-5">{part.description}</p>

            <button
              onClick={() => addItem(part)}
              disabled={part.stock === 0}
              className="w-full py-4 bg-ev-blue hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-ev-blue/20 mb-3"
            >
              {part.stock > 0 ? '🛒 Ajouter au panier' : 'Indisponible'}
            </button>

            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl p-3 text-center">
              ✅ Garantie "Bonne Pièce ou Remboursé" — Retour gratuit 30 jours
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-display font-bold text-slate-900 mb-4">Caractéristiques techniques</h3>
            <div className="space-y-3">
              {[
                { label: 'Marque', value: part.brand },
                { label: 'Référence OEM', value: part.oem_reference, mono: true },
                { label: 'Catégorie', value: `${categoryIcons[part.category]} ${categoryLabels[part.category]}` },
                { label: 'Garantie', value: `${part.warranty_months} mois` },
                part.certification && { label: 'Certification', value: part.certification },
              ].filter(Boolean).map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 text-sm">{item.label}</span>
                  <span className={`font-semibold text-slate-900 text-sm ${item.mono ? 'font-mono' : ''}`}>{item.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Livraison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-display font-bold text-slate-900 mb-3">Livraison & Retours</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">🚚 <span>Livraison rapide disponible</span></p>
              <p className="flex items-center gap-2">↩️ <span>Retour gratuit sous 30 jours</span></p>
              <p className="flex items-center gap-2">🔧 <span>Support expert VE/Hybride disponible</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
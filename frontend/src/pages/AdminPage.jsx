import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, vehiclesAPI, partsAPI, uploadsAPI, storesAPI, BASE_URL } from '../services/api'
import api from '../services/api'

export default function AdminPage() {
  const [me, setMe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('vehicle')
  const navigate = useNavigate()

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    try {
      const response = await authAPI.getMe()
      if (!response.data.is_admin) { navigate('/'); return }
      setMe(response.data)
    } catch (err) {
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ev-dark border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm mb-2 transition-colors">
            Retour
          </button>
          <h1 className="font-display text-2xl font-semibold text-white">Administration</h1>
          <p className="text-slate-400 text-sm mt-1">Connecte en tant que {me?.full_name || me?.email}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-slate-200 w-fit overflow-x-auto">
          {[
            { key: 'vehicle', label: 'Vehicule' },
            { key: 'part', label: 'Piece' },
            { key: 'editparts', label: 'Modifier pieces' },
            { key: 'images', label: 'Photos' },
            { key: 'compat', label: 'Compatibilite' },
            { key: 'stores', label: 'Magasins' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key ? 'bg-ev-blue text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'vehicle' && <VehicleForm />}
        {activeTab === 'part' && <PartForm />}
        {activeTab === 'editparts' && <EditPartsForm />}
        {activeTab === 'images' && <ImagesForm />}
        {activeTab === 'compat' && <CompatForm />}
        {activeTab === 'stores' && <StoresForm />}
      </div>
    </div>
  )
}

function VehicleForm() {
  const [form, setForm] = useState({
    vin: '', plate: '', brand: '', model: '', year: '', fuel_type: 'electric', engine: ''
  })
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const data = { ...form, year: parseInt(form.year) }
      const response = await vehiclesAPI.create(data)
      setMessage({ type: 'success', text: `Vehicule cree — ID: ${response.data.id}` })
      setForm({ vin: '', plate: '', brand: '', model: '', year: '', fuel_type: 'electric', engine: '' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-900 mb-4">Ajouter un vehicule</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input name="brand" placeholder="Marque" value={form.brand} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="model" placeholder="Modele" value={form.model} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="year" type="number" placeholder="Annee" value={form.year} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <select name="fuel_type" value={form.fuel_type} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30">
          <option value="electric">Electrique</option>
          <option value="hybrid">Hybride</option>
          <option value="thermal">Thermique</option>
        </select>
        <input name="vin" placeholder="VIN" value={form.vin} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="plate" placeholder="Plaque" value={form.plate} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="engine" placeholder="Moteur (ex: R135)" value={form.engine} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
      </div>
      {message && (
        <p className={`text-sm mb-3 ${message.type === 'success' ? 'text-ev-green' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
      <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all">
        {isSubmitting ? 'Creation...' : 'Creer le vehicule'}
      </button>
    </div>
  )
}

function PartForm() {
  const [form, setForm] = useState({
    name: '', description: '', category: 'battery', oem_reference: '', brand: '',
    price: '', stock: '', weight_kg: '', warranty_months: '24', certification: '', video_url: ''
  })
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        warranty_months: parseInt(form.warranty_months) || 24,
        image_url: ''
      }
      const response = await partsAPI.create(data)
      setMessage({ type: 'success', text: `Piece creee — ID: ${response.data.id}` })
      setForm({ name: '', description: '', category: 'battery', oem_reference: '', brand: '', price: '', stock: '', weight_kg: '', warranty_months: '24', certification: '', video_url: '' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-900 mb-4">Ajouter une piece</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input name="name" placeholder="Nom de la piece" value={form.name} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={2} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30 resize-none" />
        <select name="category" value={form.category} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30">
          <option value="battery">Batterie</option>
          <option value="motor">Moteur</option>
          <option value="brakes">Freins</option>
          <option value="cooling">Refroidissement</option>
          <option value="suspension">Suspension</option>
          <option value="electronics">Electronique</option>
          <option value="filters">Filtres</option>
          <option value="tires">Pneus</option>
          <option value="other">Autre</option>
        </select>
        <input name="brand" placeholder="Marque (ex: Bosch)" value={form.brand} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="oem_reference" placeholder="Reference OEM" value={form.oem_reference} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="price" type="number" step="0.01" placeholder="Prix" value={form.price} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="weight_kg" type="number" step="0.1" placeholder="Poids (kg)" value={form.weight_kg} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="warranty_months" type="number" placeholder="Garantie (mois)" value={form.warranty_months} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="certification" placeholder="Certification (ex: ISO 9001)" value={form.certification} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="video_url" placeholder="Lien video YouTube" value={form.video_url} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
      </div>
      {message && (
        <p className={`text-sm mb-3 ${message.type === 'success' ? 'text-ev-green' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
      <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all">
        {isSubmitting ? 'Creation...' : 'Creer la piece'}
      </button>
    </div>
  )
}

function ImagesForm() {
  const [partId, setPartId] = useState('')
  const [images, setImages] = useState([])
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const loadImages = async () => {
    if (!partId) return
    setIsLoading(true)
    setMessage(null)
    try {
      const response = await partsAPI.getImages(partId)
      setImages(response.data)
    } catch (err) {
      setMessage({ type: 'error', text: 'Piece non trouvee ou erreur' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !partId) return
    setIsUploading(true)
    setMessage(null)
    try {
      await uploadsAPI.uploadPartImage(partId, file)
      setMessage({ type: 'success', text: 'Image uploadee avec succes' })
      await loadImages()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur upload' })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (imageId) => {
    try {
      await uploadsAPI.deletePartImage(imageId)
      setImages(images.filter(img => img.id !== imageId))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-900 mb-2">Galerie photos</h3>
      <p className="text-slate-400 text-xs mb-4">Collez l'ID de la piece pour gerer sa galerie</p>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="ID de la piece"
          value={partId}
          onChange={(e) => setPartId(e.target.value)}
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ev-blue/30"
        />
        <button onClick={loadImages} className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all">
          Charger
        </button>
      </div>
      {message && (
        <p className={`text-sm mb-3 ${message.type === 'success' ? 'text-ev-green' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
      {partId && (
        <div>
          <label className="block w-full py-3 border-2 border-dashed border-slate-200 hover:border-ev-blue/40 rounded-xl text-center text-sm text-slate-500 hover:text-ev-blue cursor-pointer transition-all mb-4">
            {isUploading ? 'Upload en cours...' : 'Cliquez pour ajouter une photo (jpg, png, webp — max 5MB)'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={isUploading} className="hidden" />
          </label>
          {isLoading ? (
            <p className="text-center text-slate-400 text-sm py-4">Chargement...</p>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {images.map(img => (
                <div key={img.id} className="relative group">
                  <img src={`${BASE_URL}${img.image_url}`} alt="" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-ev-green text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Principale
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-4">Aucune image pour le moment</p>
          )}
        </div>
      )}
    </div>
  )
}

function CompatForm() {
  const [form, setForm] = useState({ part_id: '', vehicle_id: '', notes: '' })
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setMessage(null)
    try {
      await api.post('/parts/compatibility', form)
      setMessage({ type: 'success', text: 'Compatibilite ajoutee avec succes' })
      setForm({ part_id: '', vehicle_id: '', notes: '' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-900 mb-2">Lier une piece a un vehicule</h3>
      <p className="text-slate-400 text-xs mb-4">Recuperez les IDs depuis les pages Garage et le catalogue</p>
      <div className="space-y-3 mb-3">
        <input name="part_id" placeholder="ID de la piece" value={form.part_id} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="vehicle_id" placeholder="ID du vehicule" value={form.vehicle_id} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        <input name="notes" placeholder="Notes (optionnel)" value={form.notes} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
      </div>
      {message && (
        <p className={`text-sm mb-3 ${message.type === 'success' ? 'text-ev-green' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
      <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all">
        {isSubmitting ? 'Liaison...' : 'Lier la compatibilite'}
      </button>
    </div>
  )
}

function StoresForm() {
  const [stores, setStores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', address: '', phone: '', hours: '', latitude: '', longitude: '', services: ''
  })
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { loadStores() }, [])

  const loadStores = async () => {
    setIsLoading(true)
    try {
      const response = await storesAPI.list()
      setStores(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const data = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      }
      await storesAPI.create(data)
      setMessage({ type: 'success', text: 'Magasin cree avec succes' })
      setForm({ name: '', address: '', phone: '', hours: '', latitude: '', longitude: '', services: '' })
      await loadStores()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (storeId) => {
    try {
      await storesAPI.remove(storeId)
      setStores(stores.filter(s => s.id !== storeId))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-display font-semibold text-slate-900 mb-4">Ajouter un magasin</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input name="name" placeholder="Nom du magasin" value={form.name} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="address" placeholder="Adresse complete" value={form.address} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="phone" placeholder="Telephone" value={form.phone} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="hours" placeholder="Horaires (ex: Lun-Sam 8h-19h)" value={form.hours} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="latitude" type="number" step="0.0001" placeholder="Latitude (ex: 14.6937)" value={form.latitude} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="longitude" type="number" step="0.0001" placeholder="Longitude (ex: -17.4441)" value={form.longitude} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="services" placeholder="Services separes par virgule (ex: Batterie,Diagnostic)" value={form.services} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        </div>
        {message && (
          <p className={`text-sm mb-3 ${message.type === 'success' ? 'text-ev-green' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all">
          {isSubmitting ? 'Creation...' : 'Creer le magasin'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-display font-semibold text-slate-900 mb-4">Magasins existants ({stores.length})</h3>
        {isLoading ? (
          <p className="text-center text-slate-400 text-sm py-4">Chargement...</p>
        ) : stores.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">Aucun magasin pour le moment</p>
        ) : (
          <div className="space-y-2">
            {stores.map(store => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{store.name}</p>
                  <p className="text-slate-400 text-xs">{store.address}</p>
                </div>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="px-3 py-1.5 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold transition-all"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  )
}
function EditPartsForm() {
  const [parts, setParts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPart, setEditingPart] = useState(null)
  const [images, setImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { loadParts() }, [])

  const loadParts = async () => {
    setIsLoading(true)
    try {
      const response = await partsAPI.list({})
      setParts(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = async (part) => {
    setMessage(null)
    setEditingPart({
      id: part.id,
      name: part.name,
      description: part.description || '',
      category: part.category,
      oem_reference: part.oem_reference || '',
      brand: part.brand,
      price: part.price,
      stock: part.stock,
      weight_kg: part.weight_kg || '',
      warranty_months: part.warranty_months || 24,
      certification: part.certification || '',
      video_url: part.video_url || ''
    })
    try {
      const response = await partsAPI.getImages(part.id)
      setImages(response.data)
    } catch (err) {
      setImages([])
    }
  }

  const cancelEdit = () => {
    setEditingPart(null)
    setImages([])
    setMessage(null)
  }

  const handleChange = (e) => setEditingPart({ ...editingPart, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const data = {
        name: editingPart.name,
        description: editingPart.description,
        category: editingPart.category,
        oem_reference: editingPart.oem_reference,
        brand: editingPart.brand,
        price: parseFloat(editingPart.price),
        stock: parseInt(editingPart.stock),
        weight_kg: editingPart.weight_kg ? parseFloat(editingPart.weight_kg) : null,
        warranty_months: parseInt(editingPart.warranty_months),
        certification: editingPart.certification,
        video_url: editingPart.video_url
      }
      await partsAPI.update(editingPart.id, data)
      setMessage({ type: 'success', text: 'Piece mise a jour avec succes' })
      await loadParts()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePart = async (partId) => {
    try {
      await partsAPI.remove(partId)
      setParts(parts.filter(p => p.id !== partId))
      if (editingPart && editingPart.id === partId) cancelEdit()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !editingPart) return
    setIsUploading(true)
    try {
      await uploadsAPI.uploadPartImage(editingPart.id, file)
      const response = await partsAPI.getImages(editingPart.id)
      setImages(response.data)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur upload' })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      await uploadsAPI.deletePartImage(imageId)
      setImages(images.filter(img => img.id !== imageId))
    } catch (err) {
      console.error(err)
    }
  }

  if (editingPart) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-slate-900">Modifier la piece</h3>
          <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-700 text-sm font-semibold">
            Annuler
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input name="name" placeholder="Nom de la piece" value={editingPart.name} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <textarea name="description" placeholder="Description" value={editingPart.description} onChange={handleChange} rows={2} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30 resize-none" />
          <select name="category" value={editingPart.category} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30">
            <option value="battery">Batterie</option>
            <option value="motor">Moteur</option>
            <option value="brakes">Freins</option>
            <option value="cooling">Refroidissement</option>
            <option value="suspension">Suspension</option>
            <option value="electronics">Electronique</option>
            <option value="filters">Filtres</option>
            <option value="tires">Pneus</option>
            <option value="other">Autre</option>
          </select>
          <input name="brand" placeholder="Marque" value={editingPart.brand} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="oem_reference" placeholder="Reference OEM" value={editingPart.oem_reference} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="price" type="number" step="0.01" placeholder="Prix" value={editingPart.price} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="stock" type="number" placeholder="Stock" value={editingPart.stock} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="weight_kg" type="number" step="0.1" placeholder="Poids (kg)" value={editingPart.weight_kg} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="warranty_months" type="number" placeholder="Garantie (mois)" value={editingPart.warranty_months} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="certification" placeholder="Certification" value={editingPart.certification} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
          <input name="video_url" placeholder="Lien video YouTube" value={editingPart.video_url} onChange={handleChange} className="px-4 py-3 border border-slate-200 rounded-xl text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-ev-blue/30" />
        </div>

        {message && (
          <p className={`text-sm mb-3 ${message.type === 'success' ? 'text-ev-green' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}

        <button onClick={handleSave} disabled={isSubmitting} className="w-full py-3 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all mb-6">
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>

        <div className="border-t border-slate-100 pt-5">
          <h4 className="font-display font-semibold text-slate-900 mb-3">Galerie photos</h4>
          <label className="block w-full py-3 border-2 border-dashed border-slate-200 hover:border-ev-blue/40 rounded-xl text-center text-sm text-slate-500 hover:text-ev-blue cursor-pointer transition-all mb-4">
            {isUploading ? 'Upload en cours...' : 'Cliquez pour ajouter une photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={isUploading} className="hidden" />
          </label>
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {images.map(img => (
                <div key={img.id} className="relative group">
                  <img src={`${BASE_URL}${img.image_url}`} alt="" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-ev-green text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Principale
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-4">Aucune image pour le moment</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-900 mb-4">Toutes les pieces ({parts.length})</h3>
      {isLoading ? (
        <p className="text-center text-slate-400 text-sm py-4">Chargement...</p>
      ) : parts.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-4">Aucune piece pour le moment</p>
      ) : (
        <div className="space-y-2">
          {parts.map(part => (
            <div key={part.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{part.name}</p>
                <p className="text-slate-400 text-xs">{part.brand} - {part.price.toFixed(2)} euros - Stock: {part.stock}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => startEdit(part)}
                  className="px-3 py-1.5 bg-ev-blue hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeletePart(part.id)}
                  className="px-3 py-1.5 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold transition-all"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
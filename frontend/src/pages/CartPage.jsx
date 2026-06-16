import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import { ordersAPI } from '../services/api'

export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleOrder = async () => {
    if (!address.trim()) {
      setError('Veuillez entrer une adresse de livraison')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const orderItems = items.map(item => ({ part_id: item.id, quantity: item.quantity }))
      const response = await ordersAPI.create({ items: orderItems, delivery_address: address })
      setSuccess(response.data.order_id.slice(0, 8))
      clearCart()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la commande')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Commande confirmée !</h2>
          <p className="text-slate-400 font-mono text-sm mb-1">#{success}</p>
          <p className="text-slate-500 text-sm mb-6">Vous recevrez une confirmation par email.</p>
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl p-3 mb-6">
            ✅ Garantie "Bonne Pièce ou Remboursé" — Retour gratuit sous 30 jours
          </div>
          <button onClick={() => navigate('/')} className="w-full py-3 bg-ev-blue hover:bg-blue-700 text-white rounded-xl font-bold transition-all mb-3">
            Retour à l'accueil
          </button>
          <button onClick={() => navigate('/orders')} className="w-full py-3 border-2 border-slate-200 text-slate-600 hover:border-ev-blue/40 hover:text-ev-blue rounded-xl font-semibold transition-all">
            Voir mes commandes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ev-dark border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/parts')} className="text-slate-400 hover:text-white text-sm mb-2 transition-colors">← Retour</button>
          <h1 className="font-display text-2xl font-bold text-white">🛒 Mon panier</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-20 shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-slate-600 font-semibold text-lg mb-2">Votre panier est vide</p>
            <p className="text-slate-400 text-sm mb-6">Ajoutez des pièces depuis le catalogue pour commencer</p>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-ev-blue hover:bg-blue-700 text-white rounded-xl font-bold transition-all">
              Rechercher des pièces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Articles */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="font-display font-bold text-slate-900 mb-4">{items.length} article(s)</h2>
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                    🔧
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-slate-400 text-xs font-mono">{item.brand} — {item.oem_reference}</p>
                    <p className="text-slate-500 text-sm mt-1">Quantité : {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-bold text-lg text-slate-900">{(item.price * item.quantity).toFixed(2)} €</p>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold mt-1 transition-colors">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé commande */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-display font-bold text-slate-900 mb-4">Résumé</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Sous-total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Livraison</span>
                    <span className="text-ev-green font-semibold">Gratuite</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span className="font-display text-xl">{total.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-xl p-3 mb-4 text-center">
                  ✅ Garantie "Bonne Pièce ou Remboursé"
                </div>

                <textarea
                  placeholder="Adresse de livraison complète..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-ev-blue resize-none"
                />

                {error && <p className="text-red-600 text-sm mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-center">{error}</p>}

                <button
                  onClick={handleOrder}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-ev-blue hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg mb-2"
                >
                  {isLoading ? 'Traitement...' : 'Commander maintenant'}
                </button>
                <button onClick={clearCart} className="w-full py-2.5 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-semibold text-sm transition-all">
                  Vider le panier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
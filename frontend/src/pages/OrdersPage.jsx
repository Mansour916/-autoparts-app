import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersAPI } from '../services/api'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.list()
      setOrders(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const statusConfig = {
    pending: { label: 'En attente', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '⏳' },
    confirmed: { label: 'Confirmée', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '✅' },
    shipped: { label: 'Expédiée', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🚚' },
    delivered: { label: 'Livrée', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '📦' },
    returned: { label: 'Retournée', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '↩️' },
    refunded: { label: 'Remboursée', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: '💰' }
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ev-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm mb-2 transition-colors">← Retour</button>
          <h1 className="font-display text-2xl font-bold text-white">📦 Mes commandes</h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} commande(s) au total</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center text-slate-500 py-20">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-20 shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-slate-600 font-semibold text-lg mb-2">Aucune commande pour le moment</p>
            <p className="text-slate-400 text-sm mb-6">Vos commandes apparaîtront ici après votre premier achat</p>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-ev-blue hover:bg-blue-700 text-white rounded-xl font-bold transition-all">
              Rechercher des pièces
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = statusConfig[order.status] || statusConfig.pending
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Header commande */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-slate-900 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* Articles */}
                  <div className="px-6 py-4">
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">🔧</div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{item.part_name}</p>
                              <p className="text-slate-400 text-xs">{item.part_brand} · Qté : {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-bold text-slate-900 text-sm">{(item.unit_price * item.quantity).toFixed(2)} €</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <span>📍</span>
                        <span className="max-w-xs truncate">{order.delivery_address}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-xs mb-0.5">Total</p>
                        <p className="font-display font-bold text-lg text-slate-900">{order.total_price.toFixed(2)} €</p>
                      </div>
                    </div>
                  </div>

                  {order.is_free_return && (
                    <div className="px-6 py-3 bg-green-50 border-t border-green-100">
                      <p className="text-green-700 text-xs font-semibold text-center">
                        ✅ Garantie "Bonne Pièce ou Remboursé" — Retour gratuit sous 30 jours
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
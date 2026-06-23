import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, adminSellersAPI, adminDashboardAPI } from '../services/api'

export default function AdminPage() {
  const [me, setMe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stats')
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
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm mb-2 transition-colors">
            Retour
          </button>
          <h1 className="font-display text-2xl font-semibold text-white">Supervision plateforme</h1>
          <p className="text-slate-400 text-sm mt-1">Administrateur : {me?.full_name || me?.email}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-slate-200 w-fit overflow-x-auto">
          {[
            { key: 'stats', label: 'Statistiques globales' },
            { key: 'transactions', label: 'Transactions' },
            { key: 'sellers', label: 'Vendeurs' },
            { key: 'stock', label: 'Stocks critiques' },
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

        {activeTab === 'stats' && <GlobalStats />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'sellers' && <SellersForm />}
        {activeTab === 'stock' && <LowStock />}
      </div>
    </div>
  )
}

function GlobalStats() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const response = await adminDashboardAPI.getStats()
      setStats(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <p className="text-center text-slate-400 py-8">Chargement...</p>
  if (!stats) return <p className="text-center text-slate-400 py-8">Aucune donnee</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Chiffre d affaires', value: `${stats.total_revenue.toFixed(2)} €`, color: 'text-ev-green' },
          { label: 'Commandes totales', value: stats.total_orders, color: 'text-ev-blue' },
          { label: 'Acheteurs', value: stats.total_buyers, color: 'text-slate-900' },
          { label: 'Pieces au catalogue', value: stats.total_parts, color: 'text-slate-900' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">{item.label}</p>
            <p className={`font-display text-3xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">Vendeurs totaux</p>
          <p className="font-display text-3xl font-bold text-slate-900">{stats.total_sellers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-ev-green/30 bg-green-50 p-5">
          <p className="text-green-600 text-xs font-bold uppercase tracking-wide mb-2">Vendeurs approuves</p>
          <p className="font-display text-3xl font-bold text-green-700">{stats.approved_sellers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <p className="text-yellow-600 text-xs font-bold uppercase tracking-wide mb-2">En attente validation</p>
          <p className="font-display text-3xl font-bold text-yellow-700">{stats.pending_sellers}</p>
        </div>
      </div>
    </div>
  )
}

function Transactions() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    try {
      const response = await adminDashboardAPI.getTransactions()
      setOrders(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminDashboardAPI.updateOrderStatus(orderId, status)
      setMessage({ type: 'success', text: 'Statut mis a jour' })
      await loadOrders()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur' })
    }
  }

  const statusConfig = {
    pending: { label: 'En attente', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    confirmed: { label: 'Confirmee', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    shipped: { label: 'Expediee', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    delivered: { label: 'Livree', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    returned: { label: 'Retournee', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    refunded: { label: 'Remboursee', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' }
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  if (isLoading) return <p className="text-center text-slate-400 py-8">Chargement...</p>

  return (
    <div className="space-y-4">
      {message && (
        <p className={`text-sm p-3 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-ev-green' : 'bg-red-50 text-red-500'}`}>
          {message.text}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{orders.length} transaction(s) au total</p>
        <p className="text-slate-500 text-sm font-semibold">
          CA total : {orders.reduce((sum, o) => sum + o.total_price, 0).toFixed(2)} €
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-12">
          <p className="text-slate-400">Aucune transaction pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = statusConfig[order.status] || statusConfig.pending
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900 font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-slate-400 text-xs">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                      {status.label}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-ev-blue"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmee</option>
                      <option value="shipped">Expediee</option>
                      <option value="delivered">Livree</option>
                      <option value="returned">Retournee</option>
                      <option value="refunded">Remboursee</option>
                    </select>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-slate-700 text-sm font-semibold">{order.buyer_name || 'Inconnu'}</p>
                      <p className="text-slate-400 text-xs">{order.buyer_email}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {order.fulfillment_type === 'pickup' ? 'Retrait: ' + (order.pickup_store_name || '') : 'Livraison: ' + (order.delivery_address || '')}
                      </p>
                    </div>
                    <p className="font-display font-bold text-lg text-slate-900">{order.total_price.toFixed(2)} €</p>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-500">
                        <span>{item.part_name} — {item.part_brand} x{item.quantity}</span>
                        <span>{(item.unit_price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SellersForm() {
  const [sellers, setSellers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => { loadSellers() }, [])

  const loadSellers = async () => {
    setIsLoading(true)
    try {
      const response = await adminSellersAPI.list()
      setSellers(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (sellerId) => {
    setMessage(null)
    try {
      await adminSellersAPI.approve(sellerId)
      setMessage({ type: 'success', text: 'Vendeur approuve' })
      await loadSellers()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur' })
    }
  }

  const handleReject = async (sellerId) => {
    setMessage(null)
    try {
      await adminSellersAPI.reject(sellerId)
      setMessage({ type: 'success', text: 'Vendeur refuse' })
      await loadSellers()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur' })
    }
  }

  const statusConfig = {
    pending: { label: 'En attente', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    approved: { label: 'Approuve', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    rejected: { label: 'Refuse', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  }

  const pendingSellers = sellers.filter(s => s.seller_status === 'pending')
  const otherSellers = sellers.filter(s => s.seller_status !== 'pending')

  return (
    <div className="space-y-6">
      {message && (
        <p className={`text-sm p-3 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-ev-green' : 'bg-red-50 text-red-500'}`}>
          {message.text}
        </p>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-display font-semibold text-slate-900 mb-4">
          Vendeurs en attente ({pendingSellers.length})
        </h3>
        {isLoading ? (
          <p className="text-center text-slate-400 text-sm py-4">Chargement...</p>
        ) : pendingSellers.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">Aucune demande en attente</p>
        ) : (
          <div className="space-y-3">
            {pendingSellers.map(seller => (
              <div key={seller.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{seller.full_name}</p>
                    <p className="text-slate-500 text-xs">{seller.email}</p>
                    {seller.phone && <p className="text-slate-500 text-xs">{seller.phone}</p>}
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    En attente
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(seller.id)} className="flex-1 py-2 bg-ev-green hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-all">
                    Approuver
                  </button>
                  <button onClick={() => handleReject(seller.id)} className="flex-1 py-2 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-display font-semibold text-slate-900 mb-4">
          Tous les vendeurs ({otherSellers.length})
        </h3>
        {otherSellers.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">Aucun vendeur traite</p>
        ) : (
          <div className="space-y-2">
            {otherSellers.map(seller => {
              const status = statusConfig[seller.seller_status] || statusConfig.pending
              return (
                <div key={seller.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{seller.full_name}</p>
                    <p className="text-slate-400 text-xs">{seller.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                      {status.label}
                    </span>
                    {seller.seller_status === 'rejected' && (
                      <button onClick={() => handleApprove(seller.id)} className="px-3 py-1.5 bg-ev-green hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-all">
                        Reapprouver
                      </button>
                    )}
                    {seller.seller_status === 'approved' && (
                      <button onClick={() => handleReject(seller.id)} className="px-3 py-1.5 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold transition-all">
                        Suspendre
                      </button>
                    )}
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

function LowStock() {
  const [parts, setParts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadLowStock() }, [])

  const loadLowStock = async () => {
    try {
      const response = await adminDashboardAPI.getLowStock()
      setParts(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <p className="text-center text-slate-400 py-8">Chargement...</p>

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-display font-semibold text-slate-900 mb-2">Stocks critiques (5 unites ou moins)</h3>
      <p className="text-slate-400 text-xs mb-4">Ces pieces necessitent un reapprovisionnement urgent</p>
      {parts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-ev-green font-semibold">Tous les stocks sont suffisants</p>
        </div>
      ) : (
        <div className="space-y-2">
          {parts.map(part => (
            <div key={part.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${
              part.stock === 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{part.name}</p>
                <p className="text-slate-400 text-xs">{part.brand}</p>
              </div>
              <div className="text-right">
                <span className={`font-bold text-sm ${part.stock === 0 ? 'text-red-600' : 'text-yellow-700'}`}>
                  {part.stock === 0 ? 'Rupture totale' : `${part.stock} restant(s)`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
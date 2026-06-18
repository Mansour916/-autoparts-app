import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import { authAPI } from '../services/api'

const CATEGORIES = [
  {
    label: 'Batteries', icon: '🔋',
    items: ['Pack batterie 52kWh', 'Cellules lithium-ion', 'BMS (Gestion batterie)', 'Câbles haute tension']
  },
  {
    label: 'Refroidissement', icon: '❄️',
    items: ['Pompe de refroidissement', 'Radiateur batterie', 'Liquide de refroidissement', 'Capteur température']
  },
  {
    label: 'Freins', icon: '🛑',
    items: ['Plaquettes de frein', 'Disques de frein', 'Étriers', 'Liquide de frein']
  },
  {
    label: 'Électronique', icon: '⚡',
    items: ['Chargeur embarqué', 'Convertisseur DC/DC', 'Module de charge', 'Capteurs']
  },
  {
    label: 'Suspension', icon: '🔧',
    items: ['Amortisseurs', 'Ressorts', 'Silent-blocs', 'Rotules']
  },
  {
    label: 'Filtres', icon: '🧰',
    items: ['Filtre habitacle', 'Filtre air', 'Filtre huile', 'Filtre carburant']
  },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items } = useCartStore()
  const { logout } = useAuthStore()
  const [isAdmin, setIsAdmin] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const menuRef = useRef(null)

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => { checkAdmin() }, [])
  useEffect(() => { setOpenMenu(null); setSidebarOpen(false) }, [location.pathname])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const checkAdmin = async () => {
    try {
      const response = await authAPI.getMe()
      setIsAdmin(response.data.is_admin)
    } catch (err) { setIsAdmin(false) }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Overlay sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar gauche 1/4 */}
      <div className={`fixed top-0 left-0 h-full w-1/4 min-w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header sidebar */}
        <div className="bg-ev-dark px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-display font-bold text-white">AutoParts EV</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Navigation principale */}
        <div className="px-3 py-4 border-b border-slate-100 flex-shrink-0">
          {[
            { path: '/', icon: '🔍', label: 'Recherche par VIN' },
            { path: '/garage', icon: '🚗', label: 'Mon Garage' },
            { path: '/orders', icon: '📦', label: 'Mes Commandes' },
            { path: '/stores', icon: '📍', label: 'Trouver un magasin' },
            { path: '/cart', icon: '🛒', label: `Panier (${cartCount})` },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${
                location.pathname === item.path
                  ? 'bg-ev-blue text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-ev-blue'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.path === '/cart' && cartCount > 0 && (
                <span className="ml-auto bg-ev-green text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === '/admin'
                  ? 'bg-ev-amber/20 text-ev-amber'
                  : 'text-slate-700 hover:bg-ev-amber/10 hover:text-ev-amber'
              }`}
            >
              <span className="text-base">🛠️</span>
              Administration
            </button>
          )}
        </div>

        {/* Catégories */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3">
            Catégories de pièces
          </p>
          <div className="space-y-1">
            {CATEGORIES.map(cat => (
              <div key={cat.label}>
                <button
                  onClick={() => setOpenMenu(openMenu === cat.label ? null : cat.label)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-ev-blue transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{cat.icon}</span>
                    {cat.label}
                  </div>
                  <span className={`text-xs text-slate-400 transition-transform duration-200 ${openMenu === cat.label ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {/* Sous-items */}
                {openMenu === cat.label && (
                  <div className="ml-4 mt-1 mb-2 space-y-0.5 border-l-2 border-ev-blue/20 pl-3">
                    {cat.items.map(item => (
                      <button
                        key={item}
                        onClick={() => { navigate('/parts'); setSidebarOpen(false) }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:text-ev-blue hover:font-semibold rounded-lg transition-all"
                      >
                        {item}
                      </button>
                    ))}
                    <button
                      onClick={() => { navigate('/parts'); setSidebarOpen(false) }}
                      className="w-full text-left px-3 py-2 text-xs text-ev-blue font-bold hover:underline"
                    >
                      Voir tout → {cat.label}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="text-base">⏻</span>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Navbar principale */}
      <nav className="bg-ev-dark sticky top-0 z-30 shadow-lg" ref={menuRef}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">

            {/* Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex flex-col gap-1.5 p-2.5 rounded-xl hover:bg-white/10 transition-all"
                title="Menu"
              >
                <span className="block w-5 h-0.5 bg-white"></span>
                <span className="block w-5 h-0.5 bg-white"></span>
                <span className="block w-5 h-0.5 bg-white"></span>
              </button>
              <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
                <span className="text-2xl">⚡</span>
                <span className="font-display text-lg font-bold text-white hidden sm:block">AutoParts EV</span>
              </div>
            </div>

            {/* Barre de recherche rapide */}
            <div
              onClick={() => navigate('/')}
              className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer transition-all"
            >
              <span className="text-slate-400 text-sm">🔍</span>
              <span className="text-slate-400 text-sm">Rechercher par VIN ou plaque...</span>
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-ev-amber/20 text-ev-amber'
                      : 'text-slate-400 hover:text-ev-amber hover:bg-ev-amber/10'
                  }`}
                >
                  🛠️ Admin
                </button>
              )}
              <button
                onClick={() => navigate('/garage')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/garage'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🚗 Garage
              </button>
              <button
                onClick={() => navigate('/orders')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/orders'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                📦 Commandes
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="relative flex items-center gap-2 bg-ev-blue hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg"
              >
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-ev-green text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Déconnexion"
              >
                ⏻
              </button>
            </div>
          </div>

          {/* Barre catégories desktop */}
          <div className="hidden md:flex items-center gap-1 border-t border-white/5 py-2">
            {CATEGORIES.map(cat => (
              <div key={cat.label} className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenu(openMenu === cat.label ? null : cat.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    openMenu === cat.label
                      ? 'bg-ev-blue text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.icon} {cat.label}
                  <span className={`text-xs transition-transform duration-200 ${openMenu === cat.label ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {openMenu === cat.label && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-2">
                      <p className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wide">{cat.icon} {cat.label}</p>
                      {cat.items.map(item => (
                        <button
                          key={item}
                          onClick={() => { navigate('/parts'); setOpenMenu(null) }}
                          className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:text-ev-blue hover:bg-slate-50 rounded-xl transition-all font-medium"
                        >
                          {item}
                        </button>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => { navigate('/parts'); setOpenMenu(null) }}
                          className="w-full text-left px-3 py-2 text-xs text-ev-blue font-bold hover:bg-blue-50 rounded-xl transition-all"
                        >
                          Voir tout → {cat.label}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
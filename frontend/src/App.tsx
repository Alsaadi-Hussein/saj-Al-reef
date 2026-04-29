import CustomerView from './views/CustomerView'
import KitchenView from './views/KitchenView'
import WaiterView  from './views/WaiterView'
import AdminView   from './views/AdminView'
import { useStore } from './store/useStore'

const NAV = [
  { id: 'c' as const, label: '📱 الزبون'   },
  { id: 'k' as const, label: '🍳 المطبخ'   },
  { id: 'w' as const, label: '👨‍🍽️ النادل' },
  { id: 'a' as const, label: '📊 الإدارة'  },
]

export default function App() {
  const { activeView, setActiveView } = useStore()

  return (
    <div className="min-h-screen bg-bk" dir="rtl">
      {/* Top navigation */}
      <div className="flex border-b-2 border-c3">
        {NAV.map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`flex-1 py-3 px-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 font-sans
              ${activeView === v.id ? 'bg-gold text-black' : 'bg-c2 text-white/60 hover:bg-c3'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {activeView === 'c' && <CustomerView />}
      {activeView === 'k' && <KitchenView />}
      {activeView === 'w' && <WaiterView />}
      {activeView === 'a' && <AdminView />}
    </div>
  )
}

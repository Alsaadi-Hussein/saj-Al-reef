import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import type { KitchenOrder } from '../../types'


export default function KitchenView() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])

  useEffect(() => {
    api.getOrders().then(setOrders)

    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: { new: Record<string, string> }) => {
        const r = payload.new
        setOrders(prev => [{ id: r.id, table: r.table_ref, items: r.items, time: r.time, status: r.status as 'new' | 'ready' }, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload: { new: Record<string, string> }) => {
        const r = payload.new
        setOrders(prev => prev.map(o => o.id === r.id ? { ...o, status: r.status as 'new' | 'ready' } : o))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function markReady(id: string) {
    await api.markOrderReady(id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'ready' as const } : o))
  }

  return (
    <div className="p-4 bg-bk">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-[15px] font-medium text-white">SAJ AL-REEF | Kitchen Hub 🍳</div>
          <div className="text-[11px] text-white/60 mt-0.5">الطلبات النشطة — مرتبة زمنياً | Active Orders</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-ok animate-blink" />
          <span className="text-[11px] text-ok">مباشر</span>
        </div>
      </div>

      {/* Order cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(215px,1fr))' }}>
        {orders.map((o, i) => {
          const isNew   = o.status === 'new'
          const isReady = o.status === 'ready'
          return (
            <div
              key={o.id}
              className="rounded-[13px] p-3.5 animate-slide-up"
              style={{
                background: '#1A1A1A',
                border: `1px solid ${isReady ? '#4CAF50' : isNew ? 'rgba(220,169,92,0.4)' : '#242424'}`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <div className={`text-[15px] font-medium ${isReady ? 'text-ok' : 'text-gold'}`}>
                    {o.id} | {o.table}
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5">⏱ {o.time}</div>
                </div>
                {isNew   && <span className="badge badge-gold animate-blink" style={{ animationDuration: '2s' }}>جديد</span>}
                {isReady && <span className="badge badge-ok">✓ جاهز</span>}
              </div>

              <div className="text-[12px] text-white/75 bg-c1 rounded-[9px] p-2.5 mb-3 leading-relaxed">
                {o.items}
              </div>

              {isNew ? (
                <button
                  onClick={() => markReady(o.id)}
                  className="w-full py-2 rounded-[9px] text-[12px] font-medium bg-gold text-black
                    hover:bg-gold-light active:scale-95 transition-all duration-200"
                >
                  ✓ Mark Ready — تم التحضير
                </button>
              ) : (
                <div className="text-center text-[12px] text-ok py-2 rounded-[9px]" style={{ background: 'rgba(76,175,80,0.08)' }}>
                  تم التحضير ✓
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import type { Alert, Reservation, QueueItem } from '../../types'

type Row = Record<string, string | number>

const STATUS_LABEL: Record<string, string> = { serving: 'يقدّم', assigned: 'مكلّف', done: 'منتهي' }
const STATUS_BADGE: Record<string, string> = { serving: 'badge-ok', assigned: 'badge-gold', done: '' }

export default function WaiterView() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [resv,   setResv]   = useState<Reservation[]>([])
  const [queue,  setQueue]  = useState<QueueItem[]>([])

  useEffect(() => {
    api.getAlerts().then(setAlerts)
    api.getReservations().then(setResv)
    api.getQueue().then(setQueue)

    const channel = supabase
      .channel('waiter-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload: { new: Row }) => {
        const r = payload.new
        setAlerts(prev => [{ id: r.id as number, table: r.table_ref as string, type: r.type as string, emoji: r.emoji as string, time: r.time as string }, ...prev])
      })
      // @ts-ignore — Supabase v2 overload doesn't narrow correctly after chaining
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'alerts' }, (payload: { old: Row }) => {
        setAlerts(prev => prev.filter(a => a.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function dismiss(id: number) {
    await api.dismissAlert(id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="p-4 bg-bk">
      <div className="text-[15px] font-medium text-white mb-4">SAJ AL-REEF | Staff Hub 👨‍🍽️</div>

      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        {/* Smart Call Alerts */}
        <div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-gold mb-2.5">
            <div className="relative w-3 h-3 flex-shrink-0">
              <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-err" />
              <div className="absolute w-3 h-3 rounded-full bg-err opacity-20 animate-ping" style={{ animationDuration: '1.5s' }} />
            </div>
            Smart Call Alerts
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-7 text-white/25 text-[13px]">لا يوجد نداءات نشطة ✓</div>
          )}
          {alerts.map((a, i) => (
            <div
              key={a.id}
              className="bg-c2 border border-err rounded-[11px] p-3 mb-2 flex justify-between items-center animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[19px]" style={{ background: 'rgba(226,75,74,0.12)' }}>
                  {a.emoji}
                </div>
                <div>
                  <div className="text-[12px] font-medium text-white">طاولة {a.table} — {a.type}</div>
                  <div className="text-[10px] text-white/40">{a.time} PM</div>
                </div>
              </div>
              <button
                onClick={() => dismiss(a.id)}
                className="text-gold bg-transparent border border-c4 rounded-[8px] px-3 py-1 text-[11px] cursor-pointer hover:border-gold transition-colors"
              >
                تم ✓
              </button>
            </div>
          ))}
        </div>

        {/* Reservations */}
        <div>
          <div className="text-[12px] font-medium text-gold mb-2.5">📅 جدول الحجوزات</div>
          {resv.map((r, i) => (
            <div
              key={r.id}
              className="rounded-[10px] p-3 mb-2 flex justify-between items-center animate-slide-up"
              style={{
                background: '#1A1A1A',
                border: `1px solid ${r.confirmed ? 'rgba(220,169,92,0.4)' : '#242424'}`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div>
                <div className="text-[12px] font-medium text-white">{r.time} — {r.table}</div>
                <div className="text-[11px] text-white/50 mt-0.5">{r.name}</div>
              </div>
              <span className={`badge ${r.confirmed ? 'badge-gold' : ''}`}>
                {r.confirmed ? 'مؤكد' : 'انتظار'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Queue table */}
      <div className="text-[12px] font-medium text-gold mb-2.5">📋 قائمة الانتظار</div>
      <div className="bg-c1 border border-c3 rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-c2">
              <td className="px-3 py-2.5 text-white/60">الطلب</td>
              <td className="px-3 py-2.5 text-white/60">الطاولة</td>
              <td className="px-3 py-2.5 text-white/60">العناصر</td>
              <td className="px-3 py-2.5 text-white/60">النادل</td>
              <td className="px-3 py-2.5 text-white/60">الحالة</td>
            </tr>
          </thead>
          <tbody>
            {queue.map(q => (
              <tr key={q.id} className="border-t border-c2">
                <td className="px-3 py-2.5 font-medium text-gold">{q.id}</td>
                <td className="px-3 py-2.5 text-white/80">{q.table}</td>
                <td className="px-3 py-2.5 text-white/60">{q.items}</td>
                <td className="px-3 py-2.5 text-white/80">{q.waiter}</td>
                <td className="px-3 py-2.5">
                  <span className={`badge ${STATUS_BADGE[q.status]}`}>{STATUS_LABEL[q.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

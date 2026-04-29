import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import type { Table, Offer, AdminNotification, TopItem, AdminStats } from '../../types'

type Row = Record<string, unknown>

const EXTRA_OFFERS = [
  { title: 'عرض المساء',  desc: 'خصم 25% بعد 10 مساءً',      active: true },
  { title: 'وجبة الطفل', desc: 'وجبة مجانية مع كل وجبتين',  active: true },
]

const AI_INSIGHTS = [
  '💡 "قلّل سعر ساج برايم، الطلب ضعيف هذا الأسبوع"',
  '📈 "دجاج مشوي ترند اليوم — فعّل عرض خاص الآن"',
  '⏰ "ذروة الطلبات 7-9 مساءً — جهّز فريق إضافي"',
]

const TABLE_BG:   Record<string, string> = { g: '#DCA95C', e: '#E24B4A', f: '#242424' }
const TABLE_TEXT: Record<string, string> = { g: '#000',    e: '#FFF',    f: 'rgba(255,255,255,0.35)' }

export default function AdminView() {
  const [stats,    setStats]    = useState<AdminStats>({ ordersToday: 127, ordersThisHour: 18, activeTables: 9, totalTables: 15, revenue: 485000, revenueGrowth: 12, rating: 4.8 })
  const [notifs,   setNotifs]   = useState<AdminNotification[]>([])
  const [topItems, setTop]      = useState<TopItem[]>([])
  const [hourly,   setHourly]   = useState<number[]>([])
  const [tables,   setTables]   = useState<Table[]>([])
  const [offers,   setOffers]   = useState<Offer[]>([])
  const [extraIdx, setExtraIdx] = useState(0)

  useEffect(() => {
    api.getAdminData().then(d => {
      setStats(d.stats)
      setNotifs(d.notifications)
      setTop(d.topItems)
      setHourly(d.hourlyVols)
    })
    api.getTables().then(setTables)
    api.getOffers().then(setOffers)

    const channel = supabase
      .channel('admin-all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        setStats(s => ({ ...s, ordersToday: s.ordersToday + 1, ordersThisHour: s.ordersThisHour + 1 }))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: { new: Row }) => {
        const r = payload.new
        setNotifs(prev => [
          { table: r.table_ref as string, message: r.message as string, time: r.time as string, color: r.color as string },
          ...prev.slice(0, 9),
        ])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'restaurant_tables' }, (payload: { new: Row }) => {
        const r = payload.new
        setTables(prev => prev.map(t => t.n === (r.n as number) ? { n: r.n as number, s: r.status as 'g' | 'e' | 'f' } : t))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'offers' }, (payload: { new: Row }) => {
        const r = payload.new
        setOffers(prev => prev.map(o => o.id === (r.id as number)
          ? { id: r.id as number, title: r.title as string, desc: r.description as string, active: r.active as boolean }
          : o))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers' }, (payload: { new: Row }) => {
        const r = payload.new
        setOffers(prev => [...prev, { id: r.id as number, title: r.title as string, desc: r.description as string, active: r.active as boolean }])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function toggleTable(n: number) {
    const updated = await api.updateTable(n)
    setTables(prev => prev.map(t => t.n === n ? updated : t))
  }

  async function toggleOffer(id: number) {
    const updated = await api.toggleOffer(id)
    setOffers(prev => prev.map(o => o.id === id ? updated : o))
  }

  async function addOffer() {
    if (extraIdx >= EXTRA_OFFERS.length) return
    const extra = EXTRA_OFFERS[extraIdx]
    const created = await api.addOffer(extra.title, extra.desc)
    setOffers(prev => [...prev, created])
    setExtraIdx(i => i + 1)
  }

  const maxVol = Math.max(...hourly, 1)

  return (
    <div className="p-4 bg-bk">
      {/* Header */}
      <div className="flex justify-between items-center mb-3.5">
        <div>
          <div className="text-[15px] font-medium text-white">Admin Power Dashboard</div>
          <div className="text-[11px] text-white/60 mt-0.5">SAJ AL-REEF | Owner View</div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative w-2.5 h-2.5">
            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-ok" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-ok opacity-20 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
          <span className="text-[11px] text-ok">LIVE</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2.5 mb-3.5">
        {[
          { label: 'الطلبات اليوم',   value: stats.ordersToday,                           sub: `▲ ${stats.ordersThisHour} هذه الساعة`, subCl: 'text-ok' },
          { label: 'الطاولات النشطة', value: `${stats.activeTables}/${stats.totalTables}`, sub: `${Math.round(stats.activeTables / stats.totalTables * 100)}% مشغولة`, subCl: 'text-white/60' },
          { label: 'الإيراد اليوم',   value: `${(stats.revenue / 1000).toFixed(0)}K`,     sub: `د.ع ▲ ${stats.revenueGrowth}%`, subCl: 'text-ok' },
          { label: 'متوسط التقييم',   value: `${stats.rating} ★`,                         sub: 'من 5 نجوم', subCl: 'text-white/60' },
        ].map((c, i) => (
          <div key={i} className="bg-c2 border border-c3 rounded-xl p-3.5">
            <div className="text-[11px] text-white/60 mb-1">{c.label}</div>
            <div className="text-2xl font-medium text-gold">{c.value}</div>
            <div className={`text-[11px] mt-1 ${c.subCl}`}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* AI Insights + Live Notifications */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <div className="rounded-[13px] p-3.5" style={{ background: 'linear-gradient(145deg,#1A1200,#0D0D0D)', border: '1px solid #B8892A' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[15px]">🧠</span>
            <span className="text-[13px] font-medium text-gold">AI Insights</span>
            <span className="badge badge-gold mr-auto text-[10px]">مباشر</span>
          </div>
          {AI_INSIGHTS.map((ins, i) => (
            <div key={i} className="rounded-[9px] p-2.5 mb-2" style={{ background: 'rgba(220,169,92,0.08)', border: '1px solid rgba(220,169,92,0.18)' }}>
              <div className="text-[11px] text-gold-light leading-relaxed">{ins}</div>
            </div>
          ))}
        </div>

        <div className="bg-c1 border border-c3 rounded-[13px] p-3.5">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[13px] font-medium text-white">🔔 إشعارات مباشرة</div>
            <span className="badge badge-err">{notifs.length} جديد</span>
          </div>
          {notifs.slice(0, 6).map((n, i) => (
            <div key={i} className="pb-2 mb-2 pr-3 animate-slide-left" style={{ borderRight: `2.5px solid ${n.color}`, animationDelay: `${i * 0.09}s` }}>
              <div className="flex justify-between">
                <div>
                  <div className="text-[12px] font-medium text-white">طاولة {n.table}</div>
                  <div className="text-[11px] text-white/45 mt-0.5">{n.message}</div>
                </div>
                <span className="text-[10px] text-white/30">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top items + Hourly chart */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <div className="bg-c1 border border-c3 rounded-[13px] p-3.5">
          <div className="text-[13px] font-medium text-white mb-3.5">📊 الأكثر طلباً + حجم الطلبات بالساعة</div>
          {topItems.map((t, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-white/35 min-w-[14px]">{i + 1}</span>
                  <span className="text-[12px] font-medium text-white">{t.name}</span>
                </div>
                <span className="text-[12px] font-medium" style={{ color: t.color }}>{t.count} طلب</span>
              </div>
              <div className="h-[5px] rounded bg-c3">
                <div className="h-[5px] rounded" style={{ background: t.color, width: `${t.pct}%` }} />
              </div>
            </div>
          ))}

          <div className="text-[11px] text-white/60 mt-3.5 mb-2">حجم الطلبات بالساعة</div>
          <div className="flex items-end gap-0.5 h-[58px]">
            {hourly.map((v, i) => {
              const hp  = Math.round((v / maxVol) * 56)
              const col = v > 50 ? '#DCA95C' : v > 30 ? '#B8892A' : v > 15 ? '#6A4D1A' : '#2A2A2A'
              return (
                <div key={i} className="flex-1 flex items-end">
                  <div className="w-full rounded-t-sm" style={{ height: hp, background: col }} />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-c4 mt-1">
            {['12م','3م','6م','9م','12ص','3ص','6ص','9ص'].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Table map */}
        <div className="bg-c1 border border-c3 rounded-[13px] p-3.5">
          <div className="text-[13px] font-medium text-white mb-3">🗺️ خريطة الطاولات — اضغط لتغيير الحالة</div>
          <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
            {tables.map(t => (
              <div
                key={t.n}
                onClick={() => toggleTable(t.n)}
                className="py-2 px-0.5 rounded-[8px] text-center text-[11px] font-medium cursor-pointer transition-opacity duration-200 hover:opacity-80 active:scale-95"
                style={{ background: TABLE_BG[t.s], color: TABLE_TEXT[t.s] }}
              >
                {t.n}
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {[{ s: 'f', label: 'فارغ' }, { s: 'g', label: 'مشغول' }, { s: 'e', label: 'طلب حساب' }].map(({ s, label }) => (
              <div key={s} className="flex items-center gap-1.5 text-[11px] text-white/60">
                <span className="w-2.5 h-2.5 rounded-[3px] inline-block" style={{ background: TABLE_BG[s] }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offers */}
      <div className="bg-c1 border border-c3 rounded-[13px] p-3.5">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[13px] font-medium text-white">🎯 إدارة العروض</div>
          <button
            onClick={addOffer}
            disabled={extraIdx >= EXTRA_OFFERS.length}
            className="py-1.5 px-3 rounded-[9px] text-[11px] font-medium bg-gold text-black hover:bg-gold-light active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            + إضافة عرض
          </button>
        </div>
        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))' }}>
          {offers.map((o, i) => (
            <div
              key={o.id}
              className="rounded-xl p-3.5 animate-slide-up"
              style={{ background: '#1A1A1A', border: `1px solid ${o.active ? 'rgba(220,169,92,0.4)' : '#242424'}`, animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className={`text-[12px] font-medium ${o.active ? 'text-gold' : 'text-white/50'}`}>{o.title}</div>
                <div
                  onClick={() => toggleOffer(o.id)}
                  className="relative w-9 h-5 rounded-full cursor-pointer transition-colors duration-300 flex-shrink-0"
                  style={{ background: o.active ? '#DCA95C' : '#343434' }}
                >
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300" style={{ left: o.active ? '18px' : '2px' }} />
                </div>
              </div>
              <div className="text-[11px] text-white/45">{o.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

interface DaySales { day: string; val: number; orders: number }

export default function SalesView() {
  const [sales,   setSales]   = useState<DaySales[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSalesData().then(data => { setSales(data); setLoading(false) })
  }, [])

  const total  = sales.reduce((s, d) => s + d.val, 0)
  const orders = sales.reduce((s, d) => s + d.orders, 0)
  const max    = Math.max(...sales.map(d => d.val), 1)

  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
      <div className="flex justify-between items-center mb-5">
        <span className="badge badge-ok text-[11px] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse inline-block" />
          بيانات حية
        </span>
        <h1 className="text-[20px] font-semibold text-white">تقرير المبيعات</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/40">جارٍ التحميل...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'إجمالي الأسبوع', value: `${(total/1000).toFixed(0)}K د.ع` },
              { label: 'عدد الطلبات',    value: orders },
              { label: 'متوسط الطلب',    value: orders > 0 ? `${Math.round(total / orders).toLocaleString()} د.ع` : '—' },
            ].map((c, i) => (
              <div key={i} className="rounded-xl p-4 border border-c3 text-right" style={{ background: '#111111' }}>
                <div className="text-[11px] text-white/45 mb-1">{c.label}</div>
                <div className="text-[20px] font-semibold text-gold">{c.value}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="rounded-xl p-5 border border-c3 mb-5" style={{ background: '#111111' }}>
            <div className="text-[13px] font-medium text-white text-right mb-4">مبيعات الأسبوع</div>
            {sales.length === 0 ? (
              <div className="text-center py-8 text-white/25 text-[13px]">لا توجد بيانات للأسبوع الحالي</div>
            ) : (
              <div className="flex items-end gap-2 h-[140px]">
                {sales.map((d, i) => {
                  const hp = Math.round((d.val / max) * 120)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-gold font-medium">{(d.val/1000).toFixed(0)}K</span>
                      <div className="w-full rounded-t-[5px] bg-gold transition-all duration-500" style={{ height: hp }} />
                      <span className="text-[9px] text-white/40 text-center">{d.day.slice(0, 3)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Daily breakdown table */}
          {sales.length > 0 && (
            <div className="rounded-xl border border-c3 overflow-hidden" style={{ background: '#111111' }}>
              <div className="grid grid-cols-3 px-4 py-2.5 border-b border-c3" style={{ background: '#151515' }}>
                <span className="text-[11px] text-white/50 text-center">الطلبات</span>
                <span className="text-[11px] text-white/50 text-center">المبيعات</span>
                <span className="text-[11px] text-white/50 text-right">اليوم</span>
              </div>
              {sales.map((d, i) => (
                <div key={i} className={`grid grid-cols-3 px-4 py-3 ${i < sales.length - 1 ? 'border-b border-c3/50' : ''}`}>
                  <span className="text-[12px] text-white/60 text-center">{d.orders}</span>
                  <span className="text-[12px] text-gold font-medium text-center">{d.val.toLocaleString()}</span>
                  <span className="text-[12px] text-white text-right">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

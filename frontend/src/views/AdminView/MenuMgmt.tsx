import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { MenuItem } from '../../types/index'

export default function MenuMgmt() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMenu().then(data => { setItems(data); setLoading(false) })
  }, [])

  const cats: Record<string, string> = { m: 'رئيسية', s: 'مقبلات', d: 'مشروبات', sw: 'حلويات' }

  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
      <div className="flex justify-between items-center mb-5">
        <button className="bg-gold text-black text-[12px] font-medium px-4 py-2 rounded-[9px] hover:bg-gold-light active:scale-95 transition-all cursor-pointer">
          + إضافة وجبة
        </button>
        <h1 className="text-[20px] font-semibold text-white">إدارة القائمة</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/40">جارٍ التحميل...</div>
      ) : (
        <div className="grid gap-2.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl px-4 py-3 border border-c3" style={{ background: '#111111' }}>
              <div className="flex items-center gap-3">
                <button className="text-[12px] text-white/40 hover:text-err transition-colors cursor-pointer border border-c3 rounded-[7px] px-2.5 py-1 hover:border-err/50">
                  حذف
                </button>
                <button className="text-[12px] text-gold/70 hover:text-gold transition-colors cursor-pointer border border-c3 rounded-[7px] px-2.5 py-1 hover:border-gold/50">
                  تعديل
                </button>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {item.hot && <span className="badge badge-warn text-[10px]">🔥 الأشهر</span>}
                  <span className="text-[13px] font-medium text-white">{item.name}</span>
                  <span className="text-[18px]">{item.emoji}</span>
                </div>
                <div className="flex items-center justify-end gap-3 mt-0.5">
                  <span className="badge badge-gold text-[11px]">{item.price.toLocaleString()} د.ع</span>
                  <span className="text-[11px] text-white/40">{cats[item.category]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

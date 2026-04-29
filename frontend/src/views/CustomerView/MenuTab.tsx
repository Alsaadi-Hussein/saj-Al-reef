import { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore'
import { api } from '../../lib/api'
import type { MenuItem } from '../../types'

const CATS = [
  { id: 'all', label: 'الكل'    },
  { id: 's',   label: 'مقبلات' },
  { id: 'm',   label: 'رئيسية' },
  { id: 'd',   label: 'مشروبات'},
  { id: 'sw',  label: 'حلويات' },
]

export default function MenuTab() {
  const { menuCategory, setMenuCategory, cart, setCartQty } = useStore()
  const [items, setItems] = useState<MenuItem[]>([])

  useEffect(() => {
    api.getMenu().then((data) => setItems(data as MenuItem[]))
  }, [])

  const visible = menuCategory === 'all' ? items : items.filter(x => x.category === menuCategory)

  return (
    <div className="p-3.5">
      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button
            key={c.id}
            onClick={() => setMenuCategory(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 whitespace-nowrap
              ${menuCategory === c.id
                ? 'bg-gold text-black border-gold'
                : 'bg-transparent text-white/60 border-c4 hover:border-gold hover:text-gold'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Hot item banner */}
      <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-[11px] border border-gold/20"
        style={{ background: 'linear-gradient(135deg,rgba(220,169,92,.12),rgba(191,122,84,.1))' }}>
        <span className="text-sm">🔥</span>
        <span className="text-[11px] text-gold-light font-medium">الأكثر طلباً: ساج برايم | Top: Saj Prime</span>
      </div>

      {/* Items */}
      <div>
        {visible.length === 0 && (
          <div className="text-center py-8 text-white/30 text-[13px]">لا يوجد عناصر</div>
        )}
        {visible.map((item, i) => {
          const qty = cart[item.id]?.qty ?? 0
          return (
            <div
              key={item.id}
              className="bg-c2 border border-c3 rounded-xl p-3 mb-2 hover:border-gold hover:-translate-x-0.5 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 pl-2.5">
                  {item.hot && (
                    <span className="inline-block text-[10px] bg-gold/15 text-gold px-2 py-0.5 rounded-md mb-1.5">🔥 الأشهر</span>
                  )}
                  <div className="text-xl mb-1">{item.emoji}</div>
                  <div className="text-[13px] font-medium text-white mb-0.5">{item.name}</div>
                  <div className="text-[11px] text-white/45 mb-1.5">{item.desc}</div>
                  <div className="text-[14px] font-medium text-gold">
                    {item.price.toLocaleString()} <span className="text-[10px]">د.ع</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => setCartQty(item, -1)}
                        className="w-[30px] h-[30px] rounded-[8px] bg-c3 text-gold border-none text-lg flex items-center justify-center hover:bg-c4 active:scale-85 transition-all duration-150"
                      >−</button>
                      <span className="text-[14px] font-medium text-gold min-w-[16px] text-center">{qty}</span>
                      <button
                        onClick={() => setCartQty(item, 1)}
                        className="w-[30px] h-[30px] rounded-[8px] bg-gold text-black border-none text-lg flex items-center justify-center hover:bg-gold-light active:scale-85 transition-all duration-150"
                      >+</button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCartQty(item, 1)}
                      className="w-[34px] h-[34px] rounded-[10px] bg-gold text-black border-none text-xl flex items-center justify-center hover:bg-gold-light active:scale-85 transition-all duration-150"
                    >+</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

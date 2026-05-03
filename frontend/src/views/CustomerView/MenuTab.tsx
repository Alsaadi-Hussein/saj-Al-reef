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

// Map menu item names to local meal images
const MEAL_IMG: Record<string, string> = {
  'ساج برايم':    '/meal-image/img2/صاج_لحم.webp',
  'ساج دجاج':     '/meal-image/img2/صاج_دجاج.webp',
  'بيتزا الريف':  '/meal-image/img2/بيتزا_صاج_الريف.webp',
  'سلطة الريف':   '/meal-image/img2/لسلطة_البيكاسو.webp',
  'حمص طازج':    '/meal-image/img2/البادنجان_المحشي.webp',
}

export default function MenuTab() {
  const { menuCategory, setMenuCategory, cart, setCartQty } = useStore()
  const [items, setItems] = useState<MenuItem[]>([])

  useEffect(() => {
    api.getMenu().then(data => setItems(data as MenuItem[]))
  }, [])

  const visible = menuCategory === 'all' ? items : items.filter(x => x.category === menuCategory)
  const hotItem = items.find(x => x.hot)

  return (
    <div className="p-3">
      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-3" style={{ scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button
            key={c.id}
            onClick={() => setMenuCategory(c.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 whitespace-nowrap
              ${menuCategory === c.id
                ? 'bg-gold text-black border-gold'
                : 'bg-transparent text-white/55 border-c4 hover:border-gold/60 hover:text-gold/80'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Hot item banner */}
      {hotItem && (
        <div
          className="flex items-center gap-2 px-3 py-2 mb-3 rounded-[11px] border border-gold/25"
          style={{ background: 'linear-gradient(135deg,rgba(220,169,92,0.13),rgba(191,122,84,0.08))' }}
        >
          <span className="text-sm">🔥</span>
          <span className="text-[11px] text-gold-light font-medium">
            الأكثر طلباً: {hotItem.name} | Top Seller
          </span>
        </div>
      )}

      {/* Menu items */}
      <div>
        {visible.length === 0 && (
          <div className="text-center py-10 text-white/25 text-[13px]">لا يوجد عناصر</div>
        )}
        {visible.map((item, i) => {
          const qty    = cart[item.id]?.qty ?? 0
          const imgSrc = MEAL_IMG[item.name]

          return (
            <div
              key={item.id}
              className="bg-c2 border border-c3 rounded-xl overflow-hidden mb-2.5 hover:border-gold/50 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Food image */}
              {imgSrc && (
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  {item.hot && (
                    <span className="absolute top-2 right-2 text-[9px] bg-gold text-black font-semibold px-2 py-0.5 rounded-full">
                      🔥 الأشهر
                    </span>
                  )}
                  <div className="absolute bottom-2 right-3 text-[14px] font-semibold text-gold drop-shadow">
                    {item.price.toLocaleString()} <span className="text-[10px] font-normal">د.ع</span>
                  </div>
                </div>
              )}

              {/* Info row */}
              <div className="flex justify-between items-center p-3">
                <div className="flex-1 min-w-0 pl-2">
                  {!imgSrc && item.hot && (
                    <span className="inline-block text-[10px] bg-gold/15 text-gold px-2 py-0.5 rounded-md mb-1.5">🔥 الأشهر</span>
                  )}
                  {!imgSrc && <div className="text-xl mb-1">{item.emoji}</div>}
                  <div className="text-[13px] font-medium text-white truncate">{item.name}</div>
                  <div className="text-[11px] text-white/45 mt-0.5 line-clamp-1">{item.desc}</div>
                  {!imgSrc && (
                    <div className="text-[13px] font-medium text-gold mt-1.5">
                      {item.price.toLocaleString()} <span className="text-[10px]">د.ع</span>
                    </div>
                  )}
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => setCartQty(item, -1)}
                        className="w-[28px] h-[28px] rounded-[7px] bg-c3 text-gold border-none text-lg flex items-center justify-center hover:bg-c4 active:scale-85 transition-all duration-150 cursor-pointer"
                      >−</button>
                      <span className="text-[14px] font-medium text-gold min-w-[18px] text-center">{qty}</span>
                      <button
                        onClick={() => setCartQty(item, 1)}
                        className="w-[28px] h-[28px] rounded-[7px] bg-gold text-black border-none text-lg flex items-center justify-center hover:bg-gold-light active:scale-85 transition-all duration-150 cursor-pointer"
                      >+</button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCartQty(item, 1)}
                      className="w-[32px] h-[32px] rounded-[9px] bg-gold text-black border-none text-xl flex items-center justify-center hover:bg-gold-light active:scale-85 transition-all duration-150 cursor-pointer"
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

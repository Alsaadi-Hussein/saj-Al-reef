import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useStore } from '../../store/useStore'
import type { MenuItem } from '../../types/index'

const CATS = [
  { id: 'all', label: 'الكل'      },
  { id: 'm',   label: 'ساج'       },
  { id: 's',   label: 'بيتزا'    },
  { id: 'd',   label: 'مشروبات'  },
  { id: 'sw',  label: 'حلويات'   },
]

const TABLE = 'T5'
const ORDER_N = '#254'
const VAT = 0.15

type PayMethod = 'cash' | 'card'

export default function PosView() {
  const { posCategory, setPosCategory, posCart, setPosCartQty, clearPosCart } = useStore()
  const [items,     setItems]     = useState<MenuItem[]>([])
  const [paid,      setPaid]      = useState(false)
  const [printing,  setPrinting]  = useState(false)
  const [discount,  setDiscount]  = useState('')
  const [discType,  setDiscType]  = useState<'pct' | 'fixed'>('pct')
  const [payMethod, setPayMethod] = useState<PayMethod>('cash')

  useEffect(() => { api.getMenu().then(setItems) }, [])

  const visible   = posCategory === 'all' ? items : items.filter(i => i.category === posCategory)
  const cartItems = Object.values(posCart)
  const subtotal  = cartItems.reduce((s, c) => s + c.item.price * c.qty, 0)
  const discNum   = parseFloat(discount) || 0
  const discAmt   = discType === 'pct' ? Math.round(subtotal * discNum / 100) : Math.min(discNum, subtotal)
  const afterDisc = subtotal - discAmt
  const vatAmt    = Math.round(afterDisc * VAT)
  const total     = afterDisc + vatAmt

  async function checkout() {
    if (cartItems.length === 0) return
    const itemStr = cartItems.map(c => `${c.item.name}(${c.qty})`).join('، ')
    await api.placePosOrder(itemStr, TABLE, total)
    setPaid(true)
    clearPosCart()
    setDiscount('')
    setTimeout(() => setPaid(false), 3000)
  }

  async function print() {
    setPrinting(true)
    await new Promise(r => setTimeout(r, 1200))
    setPrinting(false)
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Order panel */}
      <div
        className="flex flex-col border-l border-c3"
        style={{ width: 320, background: '#0D0D0D' }}
      >
        {/* Order header */}
        <div className="px-4 pt-4 pb-3 border-b border-c3">
          <div className="flex justify-between items-center mb-1">
            <div className="flex gap-2">
              <span className="badge badge-ok text-[11px]">مفتوح</span>
              <span className="badge badge-gold text-[11px]">طاولة 5</span>
            </div>
            <span className="text-[14px] font-semibold text-gold">{ORDER_N}</span>
          </div>
          <div className="text-[11px] text-white/40 text-right mt-0.5">الطلب الحالي</div>
        </div>

        {/* Cart area */}
        <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="text-[32px] opacity-20">🍽️</div>
              <div className="text-[12px] text-white/25">انقر على الوجبة لإضافتها</div>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map(c => (
                <div key={c.item.id} className="flex items-center justify-between rounded-[10px] px-3 py-2.5 border border-c3" style={{ background: '#151515' }}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPosCartQty(c.item, -1)} className="w-6 h-6 rounded-full bg-c3 text-white text-sm flex items-center justify-center cursor-pointer hover:bg-c4 border-none">−</button>
                    <span className="text-[12px] font-medium text-gold min-w-[18px] text-center">{c.qty}</span>
                    <button onClick={() => setPosCartQty(c.item, 1)} className="w-6 h-6 rounded-full bg-gold text-black text-sm flex items-center justify-center cursor-pointer hover:bg-gold-light border-none">+</button>
                  </div>
                  <div className="text-right flex-1 mr-2">
                    <div className="text-[12px] font-medium text-white">{c.item.name}</div>
                    <div className="text-[11px] text-gold">{(c.item.price * c.qty).toLocaleString()} د.ع</div>
                  </div>
                  <span className="text-[16px]">{c.item.emoji}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + actions */}
        <div className="border-t border-c3 p-4">
          {/* Discount row */}
          <div className="flex gap-1.5 mb-3">
            <button
              onClick={() => setDiscType(t => t === 'pct' ? 'fixed' : 'pct')}
              className="text-[11px] px-2.5 py-1.5 rounded-[7px] border border-c3 text-gold/70 hover:border-gold/40 cursor-pointer transition-all flex-shrink-0"
            >
              {discType === 'pct' ? '%' : 'IQD'}
            </button>
            <input
              type="number" min={0} value={discount} onChange={e => setDiscount(e.target.value)}
              placeholder={discType === 'pct' ? 'خصم %' : 'خصم د.ع'}
              className="flex-1 bg-c2 border border-c3 rounded-[7px] px-2.5 py-1.5 text-[12px] text-white focus:outline-none focus:border-gold/50 text-right"
            />
          </div>

          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-white/50">{subtotal.toLocaleString()} د.ع</span>
              <span className="text-white/50">المجموع الفرعي</span>
            </div>
            {discAmt > 0 && (
              <div className="flex justify-between text-[12px]">
                <span className="text-ok">- {discAmt.toLocaleString()} د.ع</span>
                <span className="text-white/50">الخصم</span>
              </div>
            )}
            <div className="flex justify-between text-[12px]">
              <span className="text-white/50">{vatAmt.toLocaleString()} د.ع</span>
              <span className="text-white/50">ضريبة (15%)</span>
            </div>
            <div className="flex justify-between text-[14px] font-semibold pt-1 border-t border-c3">
              <span className="text-gold">{total.toLocaleString()} د.ع</span>
              <span className="text-white">الإجمالي</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="flex gap-2 mb-3">
            {(['cash', 'card'] as PayMethod[]).map(m => (
              <button
                key={m}
                onClick={() => setPayMethod(m)}
                className="flex-1 py-2 rounded-[9px] text-[12px] font-medium cursor-pointer transition-all border"
                style={{
                  background: payMethod === m ? (m === 'cash' ? 'rgba(76,175,80,0.15)' : 'rgba(56,120,240,0.15)') : 'transparent',
                  borderColor: payMethod === m ? (m === 'cash' ? '#4CAF50' : '#378ADD') : '#242424',
                  color: payMethod === m ? (m === 'cash' ? '#4CAF50' : '#378ADD') : 'rgba(255,255,255,0.5)',
                }}
              >
                {m === 'cash' ? '💵 نقد' : '💳 بطاقة'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => { clearPosCart(); setDiscount('') }}
              className="py-2.5 rounded-[9px] text-[12px] font-medium bg-c2 border border-c3 text-white/70 hover:bg-c3 cursor-pointer transition-all"
            >
              مسح
            </button>
            <button
              onClick={print}
              className="py-2.5 rounded-[9px] text-[12px] font-medium bg-c2 border border-c3 text-white/70 hover:bg-c3 cursor-pointer transition-all"
            >
              {printing ? '...' : '🖨 طباعة'}
            </button>
          </div>

          <button
            onClick={checkout}
            disabled={cartItems.length === 0}
            className="w-full py-3 rounded-[11px] text-[13px] font-semibold text-black hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            style={{ background: '#DCA95C' }}
          >
            {paid ? '✓ تم التحصيل!' : `${payMethod === 'cash' ? '💵' : '💳'} تحصيل ${total > 0 ? total.toLocaleString() + ' د.ع' : ''}`}
          </button>
        </div>
      </div>

      {/* Right: Menu grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-c3 flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[12px] text-white/40">ساج الريف - الكاشير</div>
            <h1 className="text-[20px] font-semibold text-white">POS — نقطة البيع</h1>
          </div>
          {/* Category filters */}
          <div className="flex gap-2">
            {CATS.map(c => (
              <button
                key={c.id}
                onClick={() => setPosCategory(c.id)}
                className="px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer"
                style={{
                  background: posCategory === c.id ? '#DCA95C' : 'transparent',
                  color: posCategory === c.id ? '#000' : 'rgba(255,255,255,0.5)',
                  borderColor: posCategory === c.id ? '#DCA95C' : '#242424',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {visible.map(item => {
              const inCart = posCart[item.id]?.qty ?? 0
              return (
                <button
                  key={item.id}
                  onClick={() => setPosCartQty(item, 1)}
                  className="rounded-xl p-4 border text-center cursor-pointer transition-all duration-200 hover:border-gold/50 active:scale-95"
                  style={{
                    background: inCart > 0 ? 'rgba(220,169,92,0.08)' : '#111111',
                    borderColor: inCart > 0 ? 'rgba(220,169,92,0.4)' : '#242424',
                  }}
                >
                  <div className="text-[28px] mb-2">{item.emoji}</div>
                  <div className="text-[12px] font-medium text-white mb-1">{item.name}</div>
                  <div className="text-[11px] text-gold">{item.price.toLocaleString()} <span className="text-[10px] text-white/40">د.ع</span></div>
                  {inCart > 0 && (
                    <div className="mt-1.5 w-5 h-5 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center mx-auto">
                      {inCart}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

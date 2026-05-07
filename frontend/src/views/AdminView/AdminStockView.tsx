import { useState } from 'react'
import { api } from '../../lib/api'
import type { StockItem } from '../../types/index'

const UNITS = ['كغ', 'لتر', 'علبة', 'كيس', 'حبة', 'رول', 'زجاجة']
const EMPTY_NEW = { name: '', current: '', minimum: '', unit: 'كغ' }

export default function AdminStockView() {
  const [items,   setItems]   = useState<StockItem[]>(() => api.getStock())
  const [editId,  setEditId]  = useState<number | null>(null)
  const [editVal, setEditVal] = useState({ current: '', minimum: '', name: '', unit: 'كغ' })
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNew]     = useState(EMPTY_NEW)
  const [error,   setError]   = useState('')

  function save(updated: StockItem[]) {
    setItems(updated)
    api.saveStock(updated)
  }

  function startEdit(item: StockItem) {
    setEditId(item.id)
    setEditVal({ current: String(item.current), minimum: String(item.minimum), name: item.name, unit: item.unit })
  }

  function saveEdit() {
    if (!editId) return
    const updated = items.map(i => i.id === editId ? {
      ...i,
      name: editVal.name,
      current: parseFloat(editVal.current) || 0,
      minimum: parseFloat(editVal.minimum) || 0,
      unit: editVal.unit,
    } : i)
    save(updated)
    setEditId(null)
  }

  function doDelete(id: number) {
    save(items.filter(i => i.id !== id))
  }

  function addItem() {
    if (!newItem.name.trim() || !newItem.current) { setError('أدخل الاسم والكمية'); return }
    const nextId = Math.max(0, ...items.map(i => i.id)) + 1
    const added: StockItem = {
      id: nextId,
      name: newItem.name.trim(),
      current: parseFloat(newItem.current) || 0,
      minimum: parseFloat(newItem.minimum) || 0,
      unit: newItem.unit,
    }
    save([...items, added])
    setNew(EMPTY_NEW)
    setShowAdd(false)
    setError('')
  }

  const lowCount = items.filter(i => i.current < i.minimum).length

  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAdd(v => !v); setError('') }}
            className="bg-gold text-black text-[12px] font-medium px-4 py-2 rounded-[9px] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            {showAdd ? '✕ إلغاء' : '+ مادة جديدة'}
          </button>
          {lowCount > 0 && (
            <span className="badge badge-warn text-[11px]">⚠ {lowCount} منخفض</span>
          )}
        </div>
        <h1 className="text-[20px] font-semibold text-white">إدارة المخزون</h1>
      </div>
      <div className="text-[11px] text-white/35 text-right mb-4">البيانات محفوظة محلياً وتظهر فوراً في شاشة المطبخ</div>

      {error && (
        <div className="rounded-[9px] px-4 py-2.5 mb-4 border border-err/40 text-err text-[12px] text-right" style={{ background: 'rgba(226,75,74,0.08)' }}>
          {error}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl p-4 border border-gold/30 mb-5" style={{ background: 'rgba(220,169,92,0.05)' }}>
          <div className="text-[13px] font-medium text-gold text-right mb-3">مادة جديدة في المخزون</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              value={newItem.name} onChange={e => setNew(n => ({ ...n, name: e.target.value }))}
              placeholder="اسم المادة *" dir="rtl"
              className="bg-c2 border border-c3 rounded-[9px] px-3 py-2 text-[12px] text-white text-right placeholder:text-white/25 focus:outline-none focus:border-gold/50"
            />
            <select
              value={newItem.unit} onChange={e => setNew(n => ({ ...n, unit: e.target.value }))}
              className="bg-c2 border border-c3 rounded-[9px] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-gold/50 cursor-pointer" dir="rtl"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              value={newItem.minimum} onChange={e => setNew(n => ({ ...n, minimum: e.target.value }))}
              placeholder="الحد الأدنى (تنبيه)" type="number" min={0}
              className="bg-c2 border border-c3 rounded-[9px] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-gold/50"
            />
            <input
              value={newItem.current} onChange={e => setNew(n => ({ ...n, current: e.target.value }))}
              placeholder="الكمية الحالية *" type="number" min={0}
              className="bg-c2 border border-c3 rounded-[9px] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-gold/50"
            />
          </div>
          <button
            onClick={addItem}
            className="w-full py-2.5 rounded-[9px] text-[13px] font-semibold text-black hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            style={{ background: '#DCA95C' }}
          >
            ✓ إضافة للمخزون
          </button>
        </div>
      )}

      <div className="grid gap-2.5">
        {items.map(item => {
          const pct = Math.min((item.current / Math.max(item.minimum * 2, 0.1)) * 100, 100)
          const low = item.current < item.minimum
          return (
            <div key={item.id}>
              {editId === item.id ? (
                <div className="rounded-xl p-4 border border-gold/40" style={{ background: '#131313' }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      value={editVal.name} onChange={e => setEditVal(v => ({ ...v, name: e.target.value }))}
                      placeholder="اسم المادة" dir="rtl"
                      className="bg-c2 border border-c3 rounded-[9px] px-3 py-2 text-[12px] text-white text-right focus:outline-none focus:border-gold/50"
                    />
                    <select
                      value={editVal.unit} onChange={e => setEditVal(v => ({ ...v, unit: e.target.value }))}
                      className="bg-c2 border border-c3 rounded-[9px] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-gold/50 cursor-pointer" dir="rtl"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      value={editVal.minimum} onChange={e => setEditVal(v => ({ ...v, minimum: e.target.value }))}
                      placeholder="الحد الأدنى" type="number" min={0}
                      className="bg-c2 border border-c3 rounded-[9px] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-gold/50"
                    />
                    <input
                      value={editVal.current} onChange={e => setEditVal(v => ({ ...v, current: e.target.value }))}
                      placeholder="الكمية الحالية" type="number" min={0}
                      className="bg-c2 border border-c3 rounded-[9px] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditId(null)} className="flex-1 py-2 rounded-[9px] text-[12px] bg-c2 border border-c3 text-white/60 hover:bg-c3 cursor-pointer">إلغاء</button>
                    <button onClick={saveEdit} className="flex-1 py-2 rounded-[9px] text-[12px] font-medium text-black cursor-pointer hover:opacity-90" style={{ background: '#DCA95C' }}>✓ حفظ</button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-4 border transition-colors" style={{ background: '#111111', borderColor: low ? 'rgba(232,160,32,0.4)' : '#242424' }}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => doDelete(item.id)} className="text-[11px] text-white/35 hover:text-err border border-c3 rounded-[7px] px-2.5 py-1 cursor-pointer hover:border-err/40 transition-colors">حذف</button>
                      <button onClick={() => startEdit(item)} className="text-[11px] text-gold/60 hover:text-gold border border-c3 rounded-[7px] px-2.5 py-1 cursor-pointer hover:border-gold/40 transition-colors">تعديل</button>
                      {low && <span className="badge badge-warn text-[10px]">⚠ منخفض</span>}
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-medium text-white">{item.name}</span>
                      <span className="text-[11px] text-white/40 mr-2">{item.current} / {item.minimum * 2} {item.unit}</span>
                    </div>
                  </div>
                  <div className="h-[5px] rounded-full bg-c3">
                    <div className="h-[5px] rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: low ? '#E8A020' : '#DCA95C' }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-white/30">الحد الأدنى: {item.minimum} {item.unit}</span>
                    <span className="text-[10px] text-white/30">المتوفر: {item.current} {item.unit}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

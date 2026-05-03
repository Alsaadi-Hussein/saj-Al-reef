import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Reservation } from '../../types/index'

const SECTIONS = ['VIP', 'عائلي', 'منفرد', 'مفتوح']

// Table map: 1-12 with random statuses
const TABLE_STATUS: Record<number, 'reserved' | 'waiting' | 'free'> = {
  1: 'reserved', 2: 'free',    3: 'reserved', 4: 'free',
  5: 'waiting',  6: 'free',    7: 'waiting',  8: 'free',
  9: 'free',    10: 'free',   11: 'reserved', 12: 'reserved',
}
const TABLE_LABEL: Record<string, string>  = { reserved: 'محجوز', waiting: 'انتظار', free: 'حر' }
const TABLE_COLOR: Record<string, string>  = {
  reserved: 'rgba(220,169,92,0.25)',
  waiting:  'rgba(226,75,74,0.25)',
  free:     '#1A1A1A',
}
const TABLE_BORDER: Record<string, string> = {
  reserved: 'rgba(220,169,92,0.5)',
  waiting:  'rgba(226,75,74,0.5)',
  free:     '#242424',
}

const TODAY_LABEL = '3 مايو'

export default function ReservationsView() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', date: '', time: '', guests: 2, section: '', notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)

  useEffect(() => { api.getReservations().then(setReservations) }, [])

  function set(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName.trim() || !form.phone.trim()) return
    setSubmitting(true)
    try {
      const r = await api.createReservation(form)
      setReservations(prev => [...prev, r])
      setSubmitted(true)
      setForm({ firstName: '', lastName: '', phone: '', date: '', time: '', guests: 2, section: '', notes: '' })
      setTimeout(() => setSubmitted(false), 3000)
    } catch {}
    setSubmitting(false)
  }

  async function cancel(id: number) {
    await api.cancelReservation(id)
    setReservations(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Reservation form */}
      <div className="flex flex-col overflow-y-auto p-6 border-l border-c3" style={{ width: 400, background: '#0D0D0D', scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
        {/* Avatar + header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-black font-bold text-[14px] flex-shrink-0">S</div>
          <div className="flex justify-between items-center flex-1">
            <div className="text-[11px] text-white/40 text-left">حجز جديد</div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/50 block mb-1.5 text-right">اسم العائلة</label>
              <input
                value={form.lastName} onChange={e => set('lastName', e.target.value)}
                placeholder="الرشيد"
                className="w-full bg-c2 border border-c3 rounded-[9px] px-3 py-2.5 text-[12px] text-white text-right placeholder:text-white/25 focus:outline-none focus:border-gold/50"
                dir="rtl"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/50 block mb-1.5 text-right">الاسم الأول</label>
              <input
                value={form.firstName} onChange={e => set('firstName', e.target.value)}
                placeholder="أحمد" required
                className="w-full bg-c2 border border-c3 rounded-[9px] px-3 py-2.5 text-[12px] text-white text-right placeholder:text-white/25 focus:outline-none focus:border-gold/50"
                dir="rtl"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-[11px] text-white/50 block mb-1.5 text-right">رقم الهاتف</label>
            <input
              value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+964 xxx xxx xxxx" required
              className="w-full bg-c2 border border-c3 rounded-[9px] px-3 py-2.5 text-[12px] text-white text-right placeholder:text-white/25 focus:outline-none focus:border-gold/50"
              dir="rtl"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/50 block mb-1.5 text-right">الوقت</label>
              <input
                type="time" value={form.time} onChange={e => set('time', e.target.value)}
                className="w-full bg-c2 border border-c3 rounded-[9px] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-gold/50"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/50 block mb-1.5 text-right">التاريخ</label>
              <input
                type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full bg-c2 border border-c3 rounded-[9px] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>

          {/* Guests + Section */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-white/50 block mb-1.5 text-right">القسم</label>
              <select
                value={form.section} onChange={e => set('section', e.target.value)}
                className="w-full bg-c2 border border-c3 rounded-[9px] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-gold/50 cursor-pointer"
                dir="rtl"
              >
                <option value="">احتر القسم</option>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-white/50 block mb-1.5 text-right">عدد الأشخاص</label>
              <select
                value={form.guests} onChange={e => set('guests', Number(e.target.value))}
                className="w-full bg-c2 border border-c3 rounded-[9px] px-3 py-2.5 text-[12px] text-white focus:outline-none focus:border-gold/50 cursor-pointer"
                dir="rtl"
              >
                {[1,2,3,4,5,6,7,8,10,12].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] text-white/50 block mb-1.5 text-right">ملاحظات خاصة</label>
            <textarea
              value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="أي طلبات خاصة..."
              rows={2}
              className="w-full bg-c2 border border-c3 rounded-[9px] px-3 py-2.5 text-[12px] text-white text-right placeholder:text-white/25 focus:outline-none focus:border-gold/50 resize-none"
              dir="rtl"
            />
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full py-3 rounded-[11px] text-[13px] font-semibold text-black hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            style={{ background: '#DCA95C' }}
          >
            {submitted ? '✓ تم الحجز!' : submitting ? 'جارٍ...' : '✓ تأكيد الحجز'}
          </button>
        </form>
      </div>

      {/* Right: Schedule + Floor map */}
      <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-2">
            <span className="badge badge-warn text-[11px]">2 انتظار</span>
            <span className="badge badge-ok text-[11px]">3 مؤكد</span>
          </div>
          <h1 className="text-[20px] font-semibold text-white">نظام الحجوزات</h1>
        </div>
        <div className="text-[12px] text-white/40 text-right mb-1">إدارة حجوزات الطاولات</div>

        {/* Today schedule */}
        <div className="rounded-xl border border-c3 overflow-hidden mb-5" style={{ background: '#111111' }}>
          <div className="flex justify-between items-center px-4 py-3 border-b border-c3">
            <span className="text-[12px] text-white/50">{TODAY_LABEL}</span>
            <span className="text-[13px] font-medium text-white">جدول اليوم</span>
          </div>
          {reservations.length === 0 ? (
            <div className="text-center py-8 text-white/25 text-[13px]">لا توجد حجوزات اليوم</div>
          ) : (
            reservations.map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between px-4 py-3 ${i < reservations.length - 1 ? 'border-b border-c3/50' : ''}`}>
                {/* Cancel + status */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cancel(r.id)}
                    className="w-6 h-6 rounded-full bg-err/15 text-err text-[11px] font-bold flex items-center justify-center cursor-pointer hover:bg-err/30 transition-colors border-none"
                  >
                    ×
                  </button>
                  <span className={`badge text-[10px] ${r.confirmed ? 'badge-ok' : 'badge-warn'}`}>
                    {r.confirmed ? '✓ مؤكد' : '✗ انتظار'}
                  </span>
                </div>
                {/* Info */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-[12px] font-medium text-white">{r.name}</div>
                    <div className="text-[10px] text-white/40">{r.guests ?? 2} أشخاص</div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium text-black" style={{ background: '#DCA95C' }}>
                    {r.table}
                  </span>
                  <span className="text-[13px] font-semibold text-white">{r.time}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floor map */}
        <div className="rounded-xl border border-c3 p-4" style={{ background: '#111111' }}>
          <div className="text-[13px] font-medium text-white text-right mb-3">خريطة الطوابق</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
              const status = TABLE_STATUS[n] ?? 'free'
              return (
                <div
                  key={n}
                  className="rounded-[9px] py-2 text-center border transition-all"
                  style={{ background: TABLE_COLOR[status], borderColor: TABLE_BORDER[status] }}
                >
                  <div className="text-[11px] font-semibold" style={{ color: status === 'reserved' ? '#DCA95C' : status === 'waiting' ? '#E24B4A' : 'rgba(255,255,255,0.35)' }}>T{n}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{TABLE_LABEL[status]}</div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 justify-end">
            {[
              { status: 'reserved', label: 'محجوز', color: '#DCA95C' },
              { status: 'waiting',  label: 'انتظار', color: '#E24B4A' },
              { status: 'free',     label: 'حر',     color: 'rgba(255,255,255,0.3)' },
            ].map(l => (
              <div key={l.status} className="flex items-center gap-1.5 text-[11px] text-white/50">
                {l.label}
                <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

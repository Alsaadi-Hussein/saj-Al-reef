import { useState } from 'react'
import { api } from '../../lib/api'

export default function BillTab() {
  const [billSent, setBillSent]   = useState(false)
  const [noteSent, setNoteSent]   = useState(false)
  const [note, setNote]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [noteLoading, setNoteLoading] = useState(false)

  async function requestBill() {
    if (loading || billSent) return
    setLoading(true)
    await api.requestBill('T5')
    setLoading(false)
    setBillSent(true)
  }

  async function sendNote() {
    if (noteLoading || !note.trim()) return
    setNoteLoading(true)
    await api.sendNote('T5', note)
    setNoteLoading(false)
    setNoteSent(true)
  }

  return (
    <div className="p-5 text-center">
      {/* Bill icon */}
      <div
        className="w-16 h-16 rounded-full bg-c2 border border-gold flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse-gold"
      >
        🧾
      </div>

      <div className="text-[17px] font-medium text-gold mb-1.5 font-serif">طلب الحساب</div>
      <div className="text-[11px] text-white/60 mb-5 leading-loose">سيصل النادل خلال دقائق</div>

      <button
        onClick={requestBill}
        disabled={loading || billSent}
        className="w-full mb-3 py-2.5 rounded-[9px] text-[12px] font-medium bg-gold text-black
          hover:bg-gold-light active:scale-95 transition-all duration-200 disabled:opacity-70"
      >
        {loading ? 'جارٍ...' : billSent ? '✓ تم الإرسال' : 'اطلب الحساب الآن'}
      </button>

      {billSent && (
        <div className="text-[12px] text-gold mb-3 animate-fade-in">✓ تم إبلاغ النادل!</div>
      )}

      <div className="h-px bg-c3 my-4" />

      <div className="text-[11px] text-white/60 text-right mb-2">لديك ملاحظة؟</div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full h-20 bg-c2 border border-c3 rounded-[10px] p-2.5 text-white text-[12px] resize-none outline-none
          focus:border-gold transition-colors duration-200 text-right font-sans"
        placeholder="اكتب ملاحظتك هنا..."
        dir="rtl"
      />
      <button
        onClick={sendNote}
        disabled={noteLoading || noteSent || !note.trim()}
        className="w-full mt-2 py-2.5 rounded-[9px] text-[12px] text-gold border border-gold-dark bg-transparent
          hover:bg-gold/10 active:scale-95 transition-all duration-200 disabled:opacity-50"
      >
        {noteSent ? '✓ تم الإرسال' : 'إرسال الملاحظة'}
      </button>
      {noteSent && (
        <div className="text-[12px] text-gold mt-2 animate-fade-in">✓ تم إرسال ملاحظتك!</div>
      )}
    </div>
  )
}

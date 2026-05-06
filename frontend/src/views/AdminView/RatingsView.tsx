import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

interface Rating { id: number; table_ref: string; food: number; service: number; overall: number; comment: string; created_at: string }

function Stars({ n }: { n: number }) {
  return <span className="text-gold text-[13px]">{'★'.repeat(Math.max(0, Math.min(5, n)))}{'☆'.repeat(Math.max(0, 5 - Math.min(5, n)))}</span>
}

export default function RatingsView() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [noTable, setNoTable] = useState(false)

  useEffect(() => {
    api.getRatings().then(data => {
      setRatings(data as Rating[])
      setLoading(false)
    }).catch(() => {
      setNoTable(true)
      setLoading(false)
    })
  }, [])

  const avgOverall = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.overall, 0) / ratings.length).toFixed(1) : '—'
  const avgFood    = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.food, 0) / ratings.length).toFixed(1) : '—'
  const avgService = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.service, 0) / ratings.length).toFixed(1) : '—'

  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
      <div className="flex justify-between items-center mb-5">
        <span className="text-[12px] text-white/40">{ratings.length} تقييم</span>
        <h1 className="text-[20px] font-semibold text-white">التقييمات</h1>
      </div>

      {noTable && (
        <div className="rounded-xl p-4 border border-warn/30 mb-5 text-right" style={{ background: 'rgba(232,160,32,0.06)' }}>
          <div className="text-[13px] text-warn font-medium mb-1">جدول التقييمات غير موجود</div>
          <div className="text-[12px] text-white/50">أنشئ جدول <code className="text-gold">ratings</code> في Supabase بالأعمدة: table_ref, food, service, overall, comment</div>
        </div>
      )}

      {!noTable && !loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'متوسط الكلي',   value: avgOverall },
              { label: 'متوسط الطعام',  value: avgFood },
              { label: 'متوسط الخدمة',  value: avgService },
            ].map((c, i) => (
              <div key={i} className="rounded-xl p-4 border border-c3 text-right" style={{ background: '#111111' }}>
                <div className="text-[11px] text-white/45 mb-1">{c.label}</div>
                <div className="text-[26px] font-semibold text-gold">{c.value}</div>
                <div className="text-[12px] text-gold mt-0.5">{'★'.repeat(Math.round(parseFloat(c.value) || 0))}</div>
              </div>
            ))}
          </div>

          {/* Ratings list */}
          {ratings.length === 0 ? (
            <div className="text-center py-20 text-white/25 text-[14px]">لا توجد تقييمات بعد</div>
          ) : (
            <div className="grid gap-3">
              {ratings.map((r, i) => (
                <div key={r.id ?? i} className="rounded-xl p-4 border border-c3" style={{ background: '#111111' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[11px] text-white/35">
                      {r.created_at ? new Date(r.created_at).toLocaleString('ar-IQ', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars n={r.overall} />
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-medium text-black" style={{ background: '#DCA95C' }}>
                        طاولة {r.table_ref}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right mb-2">
                    <div>
                      <span className="text-[10px] text-white/40">الخدمة</span>
                      <div><Stars n={r.service} /></div>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40">الطعام</span>
                      <div><Stars n={r.food} /></div>
                    </div>
                  </div>
                  {r.comment && (
                    <div className="text-[12px] text-white/60 text-right border-t border-c3/50 pt-2 mt-2">
                      "{r.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {loading && <div className="text-center py-20 text-white/40">جارٍ التحميل...</div>}
    </div>
  )
}

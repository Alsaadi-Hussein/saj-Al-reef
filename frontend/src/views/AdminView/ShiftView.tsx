import { useState } from 'react'

export default function ShiftView() {
  const [ended, setEnded] = useState(false)
  const summary = {
    orders: 220, revenue: 501100, avgOrder: 2278, topItem: 'ساج برايم', tables: 15, duration: '8 ساعات',
  }

  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
      <h1 className="text-[20px] font-semibold text-white text-right mb-5">إنهاء الوردية</h1>

      {!ended ? (
        <>
          <div className="rounded-xl p-5 border border-gold/25 mb-5 text-right" style={{ background: 'linear-gradient(145deg,#1A1200,#0D0D0D)' }}>
            <div className="text-[13px] text-gold font-medium mb-4">ملخص الوردية الحالية</div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'الطلبات',    value: summary.orders },
                { label: 'الإيراد',    value: `${summary.revenue.toLocaleString()} د.ع` },
                { label: 'متوسط الطلب', value: `${summary.avgOrder.toLocaleString()} د.ع` },
                { label: 'الأكثر طلباً', value: summary.topItem },
                { label: 'الطاولات',   value: summary.tables },
                { label: 'مدة الوردية', value: summary.duration },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-3 border border-gold/15" style={{ background: 'rgba(220,169,92,0.05)' }}>
                  <div className="text-[10px] text-white/40 mb-1">{s.label}</div>
                  <div className="text-[16px] font-semibold text-gold">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setEnded(true)}
            className="w-full py-3 rounded-[11px] text-[14px] font-semibold bg-err text-white hover:bg-err/80 active:scale-95 transition-all cursor-pointer"
          >
            ✓ إنهاء الوردية الآن
          </button>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-[48px] mb-4">✓</div>
          <div className="text-[18px] font-semibold text-ok mb-2">تم إنهاء الوردية</div>
          <div className="text-[13px] text-white/45 mb-6">تم حفظ جميع البيانات بنجاح</div>
          <button
            onClick={() => setEnded(false)}
            className="py-2.5 px-6 rounded-[9px] text-[12px] bg-gold text-black font-medium hover:bg-gold-light cursor-pointer transition-all"
          >
            بدء وردية جديدة
          </button>
        </div>
      )}
    </div>
  )
}

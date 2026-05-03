export default function SalesView() {
  const weeklySales = [
    { day: 'السبت',    val: 280000, orders: 48 },
    { day: 'الجمعة',   val: 320000, orders: 62 },
    { day: 'الخميس',   val: 240000, orders: 41 },
    { day: 'الأربعاء', val: 360000, orders: 68 },
    { day: 'الثلاثاء', val: 310000, orders: 55 },
    { day: 'الاثنين',  val: 420000, orders: 78 },
    { day: 'الأحد',    val: 410000, orders: 74 },
  ]
  const total  = weeklySales.reduce((s, d) => s + d.val, 0)
  const orders = weeklySales.reduce((s, d) => s + d.orders, 0)
  const max    = Math.max(...weeklySales.map(d => d.val))

  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}>
      <h1 className="text-[20px] font-semibold text-white text-right mb-5">تقرير المبيعات</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'إجمالي الأسبوع', value: `${(total/1000).toFixed(0)}K د.ع` },
          { label: 'عدد الطلبات',    value: orders },
          { label: 'متوسط الطلب',    value: `${Math.round(total / orders).toLocaleString()} د.ع` },
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
        <div className="flex items-end gap-2 h-[140px]">
          {weeklySales.map((d, i) => {
            const hp = Math.round((d.val / max) * 120)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gold font-medium">{(d.val/1000).toFixed(0)}K</span>
                <div className="w-full rounded-t-[5px] bg-gold" style={{ height: hp }} />
                <span className="text-[9px] text-white/40 text-center">{d.day.slice(0, 3)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily breakdown table */}
      <div className="rounded-xl border border-c3 overflow-hidden" style={{ background: '#111111' }}>
        <div className="grid grid-cols-3 px-4 py-2.5 border-b border-c3 bg-c2">
          <span className="text-[11px] text-white/50 text-center">الطلبات</span>
          <span className="text-[11px] text-white/50 text-center">المبيعات</span>
          <span className="text-[11px] text-white/50 text-right">اليوم</span>
        </div>
        {weeklySales.map((d, i) => (
          <div key={i} className={`grid grid-cols-3 px-4 py-3 ${i < weeklySales.length - 1 ? 'border-b border-c3/50' : ''}`}>
            <span className="text-[12px] text-white/60 text-center">{d.orders}</span>
            <span className="text-[12px] text-gold font-medium text-center">{d.val.toLocaleString()}</span>
            <span className="text-[12px] text-white text-right">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

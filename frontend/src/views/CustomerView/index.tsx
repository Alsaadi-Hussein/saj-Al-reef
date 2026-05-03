import { useState } from 'react'
import { useStore } from '../../store/useStore'
import MenuTab    from './MenuTab'
import CartTab    from './CartTab'
import BillTab    from './BillTab'

// Bottom nav tabs: الرئيسية | القائمة | السلة | تقاسم | QR
type PhoneTab = 'home' | 'menu' | 'cart' | 'split' | 'qr'

const TABLE = 'T5'

export default function CustomerView() {
  const [phoneTab, setPhoneTab] = useState<PhoneTab>('home')
  const { cart } = useStore()
  const cartCount = Object.values(cart).reduce((s, c) => s + c.qty, 0)

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Feature list */}
      <div className="flex-1 flex flex-col justify-center p-10 border-l border-c3" style={{ maxWidth: 460 }}>
        <h2 className="text-[26px] font-semibold text-white text-right mb-1">تطبيق الزبون</h2>
        <p className="text-[13px] text-white/45 text-right mb-8">تجربة الطاولة بمسح QR</p>

        <div className="space-y-5">
          {[
            { icon: '📷', title: 'مسح QR',          desc: 'فتح تلقائي بدون تثبيت تطبيق' },
            { icon: '🔴', title: 'تتبع مباشر',       desc: '4 مراحل: طلب → تحضير → جاهز → تقديم' },
            { icon: '📋', title: 'قائمة تفاعلية',    desc: 'تصفية حسب الفئة، إضافة للسلة، عداد الطلبات' },
            { icon: '✖',  title: 'تقاسم الدفع',      desc: 'تقسيم الفاتورة حسب الأشخاص والوجبات' },
            { icon: '🔮', title: 'نداء ذكي',          desc: 'نادل / ماء / مناديل بضغطة واحدة' },
            { icon: '💳', title: 'طلب الحساب',        desc: 'طلب رقمي بدون انتظار النادل' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 text-right">
              <div className="flex-1">
                <div className="text-[13px] font-medium text-white">{f.title}</div>
                <div className="text-[11px] text-white/40 mt-0.5">{f.desc}</div>
              </div>
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: 'rgba(220,169,92,0.1)' }}>
                {f.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Phone mockup */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="relative rounded-[32px] border-2 border-c3 overflow-hidden flex flex-col"
          style={{
            width: 300,
            height: 620,
            background: '#0D0D0D',
            boxShadow: '0 0 60px rgba(220,169,92,0.1), 0 30px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Phone header */}
          <div className="px-4 pt-4 pb-3 border-b border-c3 flex-shrink-0" style={{ background: '#111111' }}>
            <div className="flex justify-between items-start">
              <button className="text-[10px] text-white/50 bg-c2 border border-c3 rounded-[6px] px-2 py-0.5 hover:border-gold/40 transition-colors cursor-pointer">
                AR/EN
              </button>
              <div className="text-right">
                <div className="text-[14px] font-semibold text-gold">ساج الريف | طاولة 5</div>
                <div className="text-[10px] text-white/40 mt-0.5">رمز QR · المسح المباشر 1</div>
              </div>
            </div>
          </div>

          {/* Phone content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {phoneTab === 'home' && <HomeScreen onNav={setPhoneTab} />}
            {phoneTab === 'menu' && <MenuTab />}
            {phoneTab === 'cart' && <CartTab table={TABLE} />}
            {phoneTab === 'split' && <BillTab table={TABLE} />}
            {phoneTab === 'qr' && <QrScreen />}
          </div>

          {/* Bottom nav */}
          <div
            className="flex border-t border-c3 flex-shrink-0"
            style={{ background: '#111111' }}
          >
            {([
              { id: 'home' as PhoneTab,  icon: '🏠', label: 'الرئيسية' },
              { id: 'menu' as PhoneTab,  icon: '📋', label: 'القائمة'  },
              { id: 'cart' as PhoneTab,  icon: '🛒', label: 'السلة',   badge: cartCount },
              { id: 'split' as PhoneTab, icon: '✖',  label: 'تقاسم'   },
              { id: 'qr' as PhoneTab,    icon: '📷', label: 'QR'       },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setPhoneTab(t.id)}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5 cursor-pointer border-none transition-all duration-150"
                style={{ background: 'transparent' }}
              >
                <div className="relative">
                  <span className="text-[18px]">{t.icon}</span>
                  {'badge' in t && (t.badge as number) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-err text-white text-[9px] font-bold flex items-center justify-center">
                      {t.badge as number}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] ${phoneTab === t.id ? 'text-gold font-medium' : 'text-white/40'}`}>
                  {t.label}
                </span>
                {phoneTab === t.id && <div className="w-1 h-1 rounded-full bg-gold mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Home Screen (inside phone) ───────────────────────────────
function HomeScreen({ onNav }: { onNav: (t: PhoneTab) => void }) {
  const [smartCallSent, setSmartCallSent] = useState(false)
  const [ratingFood, setRatingFood] = useState(5)
  const [ratingService, setRatingService] = useState(4)
  const [ratingOverall, setRatingOverall] = useState(5)
  const [comment, setComment] = useState('')

  const steps = [
    { label: 'تم الطلب',      time: '7:05 م', done: true },
    { label: 'قيد التحضير',   time: '7:10 م', done: true },
    { label: 'جاهز',          time: '7:25 م', done: false },
    { label: 'تم التقديم',    time: '',        done: false },
  ]

  return (
    <div className="p-3.5 space-y-3">
      {/* Tracking */}
      <div className="rounded-[11px] p-3.5 border border-c3" style={{ background: '#151515' }}>
        <div className="text-[11px] font-medium text-gold text-right mb-3">تتبع الطلب المباشر</div>
        <div className="space-y-2.5">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${s.done ? 'border-gold bg-gold' : 'border-c3 bg-transparent'}`}>
                {s.done && <span className="text-black text-[10px] font-bold">✓</span>}
              </div>
              <div className="text-right flex-1 ml-2">
                <span className={`text-[11px] ${s.done ? 'text-white' : 'text-white/35'}`}>{s.label}</span>
                {s.time && <span className="text-[10px] text-white/30 mr-2">{s.time}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Call */}
      <button
        onClick={() => setSmartCallSent(true)}
        className={`w-full py-3 rounded-[11px] text-[13px] font-semibold transition-all duration-200 cursor-pointer
          ${smartCallSent ? 'bg-ok/15 text-ok border border-ok/30' : 'text-black border-none hover:opacity-90 active:scale-95'}`}
        style={!smartCallSent ? { background: '#DCA95C' } : {}}
      >
        {smartCallSent ? '✓ تم إرسال النداء' : 'SMART CALL — نداء ذكي'}
      </button>

      {/* Quick calls */}
      <div className="grid grid-cols-4 gap-1.5">
        {['نادل', 'ماء', 'مناديل', 'أكياس'].map(item => (
          <button key={item} className="bg-c2 border border-c3 rounded-[9px] py-2 text-[11px] text-white/70 hover:border-gold/40 hover:text-gold transition-all cursor-pointer">
            {item}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button className="bg-c2 border border-c3 rounded-[9px] py-2.5 text-[11px] text-white/70 hover:border-gold/40 transition-all cursor-pointer">
          📋 وصف التفصيلي
        </button>
        <button className="bg-c2 border border-c3 rounded-[9px] py-2.5 text-[11px] text-white/70 hover:border-gold/40 transition-all cursor-pointer">
          📅 حجز طاولة
        </button>
      </div>

      <button
        onClick={() => onNav('split')}
        className="w-full py-2.5 rounded-[11px] text-[12px] font-semibold text-black hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        style={{ background: '#DCA95C' }}
      >
        💳 طلب الحساب
      </button>

      <button
        onClick={() => onNav('split')}
        className="w-full py-2.5 rounded-[11px] text-[12px] font-medium bg-c2 border border-c3 text-white/70 hover:border-gold/40 transition-all cursor-pointer"
      >
        ✖ تقاسم الدفع
      </button>

      {/* Rating */}
      <div className="rounded-[11px] p-3.5 border border-c3" style={{ background: '#151515' }}>
        <div className="text-[11px] font-medium text-white/60 text-right mb-3">تقييم الخدمة والأكل</div>
        <div className="space-y-2">
          {[
            { label: 'الطعام',  val: ratingFood,    set: setRatingFood },
            { label: 'الخدمة',  val: ratingService, set: setRatingService },
            { label: 'عام',     val: ratingOverall, set: setRatingOverall },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => r.set(n)} className="text-[14px] cursor-pointer transition-all active:scale-75 border-none bg-transparent p-0">
                    {n <= r.val ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-white/50">{r.label}</span>
            </div>
          ))}
        </div>
        <input
          value={comment} onChange={e => setComment(e.target.value)}
          placeholder="أضف تعليقاً..."
          className="w-full mt-3 bg-c2 border border-c3 rounded-[8px] px-3 py-2 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-gold/40 text-right"
          dir="rtl"
        />
      </div>
    </div>
  )
}

// ─── QR Screen ────────────────────────────────────────────────
function QrScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-4">
      <div className="w-[140px] h-[140px] border-2 border-gold/50 rounded-[12px] flex items-center justify-center bg-c2">
        <div className="grid grid-cols-3 gap-1 opacity-70">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-[3px]" style={{ background: [0,2,6,8].includes(i) ? '#DCA95C' : i === 4 ? '#DCA95C' : 'rgba(220,169,92,0.15)' }} />
          ))}
        </div>
      </div>
      <div className="text-[13px] text-white/60 text-center">امسح للوصول المباشر</div>
      <div className="text-[11px] text-white/30 text-center">ساج الريف | طاولة 5</div>
    </div>
  )
}

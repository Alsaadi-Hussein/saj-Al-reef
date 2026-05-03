import { useStore } from '../../store/useStore'
import TrackingTab from './TrackingTab'
import MenuTab     from './MenuTab'
import CartTab     from './CartTab'
import BillTab     from './BillTab'
import RatingTab   from './RatingTab'

const TABS = ['تتبع', 'المنيو', 'سلتي', 'الحساب', 'تقييم']

export default function CustomerView() {
  const { customerTab, setCustomerTab } = useStore()

  return (
    <div className="flex justify-center p-4 bg-bk">
      <div style={{ width: 308 }}>
        {/* Phone frame */}
        <div
          className="bg-c1 border-2 border-c3 rounded-[28px] overflow-hidden"
          style={{ boxShadow: '0 0 50px rgba(220,169,92,0.07)' }}
        >
          {/* Phone header */}
          <div className="bg-c2 px-3.5 pt-4 pb-0 border-b border-c3">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-[10px] text-gold-dark tracking-[2px] mb-0.5">
                  SAJ AL-REEF | TABLE 5 (QR 📍)
                </div>
                <div className="text-[19px] font-medium text-gold font-serif">ساج الريف</div>
                <div className="text-[10px] text-white/30 mt-0.5">أهلاً وسهلاً</div>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <button className="bg-c3 text-gold border border-c4 rounded-[7px] px-2.5 py-1 text-[11px] cursor-pointer hover:bg-c4 transition-colors">
                  AR
                </button>
                <div className="flex items-center gap-1.5">
                  <div className="relative w-2 h-2">
                    <div className="absolute w-2 h-2 rounded-full bg-ok" />
                    <div className="absolute w-2 h-2 rounded-full bg-ok animate-ping" style={{ animationDuration: '1.8s' }} />
                  </div>
                  <span className="text-[10px] text-ok">مباشر</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex">
              {TABS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setCustomerTab(i)}
                  className={`flex-1 py-2 px-0.5 text-[11px] border-b-2 transition-all duration-200 bg-transparent font-sans
                    ${customerTab === i
                      ? 'text-gold-light font-medium border-gold'
                      : 'text-white/45 border-transparent hover:text-white/70'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div
            className="h-[490px] overflow-y-auto bg-bk"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#343434 transparent' }}
          >
            {customerTab === 0 && <TrackingTab />}
            {customerTab === 1 && <MenuTab />}
            {customerTab === 2 && <CartTab />}
            {customerTab === 3 && <BillTab />}
            {customerTab === 4 && <RatingTab />}
          </div>
        </div>

        <div className="text-center mt-3 text-[10px] text-white/20 tracking-wide font-sans">
          اطلب • تتبع • قيّم
        </div>
      </div>
    </div>
  )
}

import { supabase } from './supabase'
import type { MenuItem, KitchenOrder, Alert, Reservation, QueueItem, Table, Offer, AdminNotification } from '../types'

// ─── Row mappers (DB columns → app types) ───────────────────
const mapMenuItem = (r: any): MenuItem => ({ id: r.id, name: r.name, desc: r.description, price: r.price, category: r.category, emoji: r.emoji, hot: r.hot ?? false })
const mapOrder    = (r: any): KitchenOrder => ({ id: r.id, table: r.table_ref, items: r.items, time: r.time, status: r.status })
export const mapAlert = (r: any): Alert => ({ id: r.id, table: r.table_ref, type: r.type, emoji: r.emoji, time: r.time })
export const mapTable = (r: any): Table => ({ n: r.n, s: r.status })
export const mapOffer = (r: any): Offer => ({ id: r.id, title: r.title, desc: r.description, active: r.active })
const mapNotif    = (r: any): AdminNotification => ({ table: r.table_ref, message: r.message, time: r.time, color: r.color })
const mapResv     = (r: any): Reservation => ({ id: r.id, time: r.time, table: r.table_ref, name: r.name, confirmed: r.confirmed })
const mapQueue    = (r: any): QueueItem => ({ id: r.id, table: r.table_ref, items: r.items, waiter: r.waiter, status: r.status })

function nowStr(): string {
  const d = new Date()
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ─── API ─────────────────────────────────────────────────────
export const api = {
  // Menu
  getMenu: async (): Promise<MenuItem[]> => {
    const { data } = await supabase.from('menu_items').select('*').order('id')
    return (data ?? []).map(mapMenuItem)
  },

  // Orders
  getOrders: async (): Promise<KitchenOrder[]> => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    return (data ?? []).map(mapOrder)
  },

  placeOrder: async (items: string, table: string): Promise<KitchenOrder> => {
    const id = `#${Date.now().toString().slice(-5)}`
    const { data, error } = await supabase
      .from('orders')
      .insert({ id, table_ref: table, items, time: nowStr(), status: 'new' })
      .select().single()
    if (error) throw error
    // Notification is broadcast automatically via Realtime when inserted
    await supabase.from('notifications').insert({ table_ref: table.replace('T', ''), message: `طلب جديد ${id}`, time: 'الآن', color: '#DCA95C' })
    return mapOrder(data)
  },

  markOrderReady: async (id: string): Promise<KitchenOrder> => {
    const { data, error } = await supabase.from('orders').update({ status: 'ready' }).eq('id', id).select().single()
    if (error) throw error
    return mapOrder(data)
  },

  // Alerts
  getAlerts: async (): Promise<Alert[]> => {
    const { data } = await supabase.from('alerts').select('*').order('created_at')
    return (data ?? []).map(mapAlert)
  },

  sendAlert: async (table: string, type: string, emoji: string): Promise<Alert> => {
    const { data, error } = await supabase
      .from('alerts')
      .insert({ table_ref: table, type, emoji, time: nowStr() })
      .select().single()
    if (error) throw error
    await supabase.from('notifications').insert({ table_ref: table, message: `نداء: ${type}`, time: 'الآن', color: '#E8A020' })
    return mapAlert(data)
  },

  dismissAlert: async (id: number): Promise<void> => {
    await supabase.from('alerts').delete().eq('id', id)
  },

  // Reservations & Queue
  getReservations: async (): Promise<Reservation[]> => {
    const { data } = await supabase.from('reservations').select('*').order('time')
    return (data ?? []).map(mapResv)
  },

  getQueue: async (): Promise<QueueItem[]> => {
    const { data } = await supabase.from('queue').select('*')
    return (data ?? []).map(mapQueue)
  },

  // Tables
  getTables: async (): Promise<Table[]> => {
    const { data } = await supabase.from('restaurant_tables').select('*').order('n')
    return (data ?? []).map(mapTable)
  },

  updateTable: async (n: number): Promise<Table> => {
    const { data: cur } = await supabase.from('restaurant_tables').select('status').eq('n', n).single()
    const cycle: Record<string, string> = { g: 'e', e: 'f', f: 'g' }
    const next = cycle[cur?.status ?? 'f'] ?? 'f'
    const { data, error } = await supabase.from('restaurant_tables').update({ status: next }).eq('n', n).select().single()
    if (error) throw error
    return mapTable(data)
  },

  // Offers
  getOffers: async (): Promise<Offer[]> => {
    const { data } = await supabase.from('offers').select('*').order('id')
    return (data ?? []).map(mapOffer)
  },

  toggleOffer: async (id: number): Promise<Offer> => {
    const { data: cur } = await supabase.from('offers').select('active').eq('id', id).single()
    const { data, error } = await supabase.from('offers').update({ active: !cur?.active }).eq('id', id).select().single()
    if (error) throw error
    return mapOffer(data)
  },

  addOffer: async (title: string, description: string): Promise<Offer> => {
    const { data, error } = await supabase.from('offers').insert({ title, description, active: true }).select().single()
    if (error) throw error
    return mapOffer(data)
  },

  // Bill request
  requestBill: async (table: string): Promise<void> => {
    const n = parseInt(table.replace('T', ''))
    await supabase.from('restaurant_tables').update({ status: 'e' }).eq('n', n)
    await supabase.from('notifications').insert({ table_ref: table.replace('T', ''), message: 'طلب الحساب', time: 'الآن', color: '#E24B4A' })
  },

  // Note
  sendNote: async (table: string, note: string): Promise<void> => {
    await supabase.from('notifications').insert({ table_ref: table.replace('T', ''), message: `ملاحظة: ${note.slice(0, 30)}`, time: 'الآن', color: '#4CAF50' })
  },

  // Rating
  submitRating: async (_food: number, _service: number, overall: number, _comment: string): Promise<void> => {
    await supabase.from('notifications').insert({ table_ref: '5', message: `تقييم ${'★'.repeat(overall)}`, time: 'الآن', color: '#4CAF50' })
  },

  // Admin bundle
  getAdminData: async () => {
    const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10)
    return {
      stats:        { ordersToday: 127, ordersThisHour: 18, activeTables: 9, totalTables: 15, revenue: 485000, revenueGrowth: 12, rating: 4.8 },
      notifications: (notifData ?? []).map(mapNotif),
      topItems: [
        { name: 'ساج برايم',   count: 89, pct: 89, color: '#DCA95C' },
        { name: 'بيتزا الريف', count: 72, pct: 72, color: '#4CAF50' },
        { name: 'دجاج مشوي',  count: 55, pct: 55, color: '#378ADD' },
        { name: 'حمص',         count: 41, pct: 41, color: '#E8A020' },
        { name: 'بقلاوة',      count: 28, pct: 28, color: '#BF7A54' },
      ],
      hourlyVols:  [2,1,3,7,20,38,55,60,48,62,45,28,18,12,8,5,3,2,5,18,42,58,62,38],
      aiInsights:  [
        '💡 "قلّل سعر ساج برايم، الطلب ضعيف هذا الأسبوع"',
        '📈 "دجاج مشوي ترند اليوم — فعّل عرض خاص الآن"',
        '⏰ "ذروة الطلبات 7-9 مساءً — جهّز فريق إضافي"',
      ],
    }
  },
}

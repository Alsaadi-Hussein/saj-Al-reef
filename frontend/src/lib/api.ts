import { supabase } from './supabase'
import type { MenuItem, KitchenOrder, Alert, Reservation, QueueItem, Table, Offer, AdminNotification, StockItem } from '../types/index'

// ─── Row mappers ─────────────────────────────────────────────
const mapMenuItem = (r: any): MenuItem => ({ id: r.id, name: r.name, desc: r.description, price: r.price, category: r.category, emoji: r.emoji, hot: r.hot ?? false })
const mapOrder    = (r: any): KitchenOrder => ({ id: r.id, table: r.table_ref, items: r.items, time: r.time, status: r.status, createdAt: r.created_at })
export const mapAlert = (r: any): Alert => ({ id: r.id, table: r.table_ref, type: r.type, emoji: r.emoji, time: r.time })
export const mapTable = (r: any): Table => ({ n: r.n, s: r.status })
export const mapOffer = (r: any): Offer => ({ id: r.id, title: r.title, desc: r.description, active: r.active })
const mapNotif    = (r: any): AdminNotification => ({ table: r.table_ref, message: r.message, time: r.time, color: r.color })
const mapResv     = (r: any): Reservation => ({ id: r.id, time: r.time, table: r.table_ref, name: r.name, confirmed: r.confirmed, guests: r.guests ?? 2, phone: r.phone ?? '', notes: r.notes ?? '' })
const mapQueue    = (r: any): QueueItem => ({ id: r.id, table: r.table_ref, items: r.items, waiter: r.waiter, status: r.status })

function nowStr(): string {
  const d = new Date()
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function minutesAgo(createdAt: string | undefined): number {
  if (!createdAt) return 0
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
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
    await supabase.from('notifications').insert({ table_ref: table.replace('T', ''), message: `طلب جديد ${id}`, time: 'الآن', color: '#DCA95C' })
    return mapOrder(data)
  },

  markOrderReady: async (id: string): Promise<KitchenOrder> => {
    const { data, error } = await supabase.from('orders').update({ status: 'ready' }).eq('id', id).select().single()
    if (error) throw error
    return mapOrder(data)
  },

  getOrderMinutesAgo: (order: KitchenOrder): number => minutesAgo(order.createdAt),

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

  createReservation: async (r: { firstName: string; lastName: string; phone: string; date: string; time: string; guests: number; section: string; notes: string }): Promise<Reservation> => {
    const name = `${r.firstName} ${r.lastName}`.trim()
    const tableN = Math.floor(Math.random() * 12) + 1
    const { data, error } = await supabase
      .from('reservations')
      .insert({ name, table_ref: `T${tableN}`, time: r.time, confirmed: true, guests: r.guests, phone: r.phone, notes: r.notes })
      .select().single()
    if (error) throw error
    await supabase.from('notifications').insert({ table_ref: String(tableN), message: `حجز مؤكد — ${name}`, time: 'الآن', color: '#4CAF50' })
    return mapResv(data)
  },

  cancelReservation: async (id: number): Promise<void> => {
    await supabase.from('reservations').delete().eq('id', id)
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

  deleteOffer: async (id: number): Promise<void> => {
    await supabase.from('offers').delete().eq('id', id)
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

  // Rating — stored in notifications table with RATING: prefix so no extra table is needed
  submitRating: async (food: number, service: number, overall: number, comment: string, table = '5'): Promise<void> => {
    const msg = `RATING:${food}:${service}:${overall}:${comment.replace(/:/g, ';')}`
    await supabase.from('notifications').insert({ table_ref: table, message: msg, time: nowStr(), color: '#9C27B0' })
  },

  getRatings: async (): Promise<{ table_ref: string; food: number; service: number; overall: number; comment: string; created_at: string }[]> => {
    const { data } = await supabase.from('notifications').select('*').like('message', 'RATING:%').order('created_at', { ascending: false }).limit(50)
    return (data ?? []).map((r: any) => {
      const [, food, service, overall, ...rest] = r.message.split(':')
      return {
        table_ref: r.table_ref, created_at: r.created_at,
        food: parseInt(food) || 5, service: parseInt(service) || 5, overall: parseInt(overall) || 5,
        comment: rest.join(':').replace(/;/g, ':'),
      }
    })
  },

  // Stock (fallback to static if no table exists)
  getStock: async (): Promise<StockItem[]> => {
    try {
      const { data, error } = await supabase.from('stock').select('*').order('id')
      if (error || !data || data.length === 0) throw new Error('no data')
      return data.map((r: any) => ({ id: r.id, name: r.name, current: r.current, minimum: r.minimum, unit: r.unit }))
    } catch {
      return [
        { id: 1, name: 'جبنة موزاريلا', current: 3.5, minimum: 4,  unit: 'كغ' },
        { id: 2, name: 'زيت زيتون',     current: 1.5, minimum: 5,  unit: 'لتر' },
        { id: 3, name: 'جبن كريمي',     current: 2,   minimum: 3,  unit: 'كغ' },
        { id: 4, name: 'دقيق',           current: 12,  minimum: 10, unit: 'كغ' },
        { id: 5, name: 'طماطم',          current: 8,   minimum: 5,  unit: 'كغ' },
        { id: 6, name: 'لحم بقري',       current: 5,   minimum: 4,  unit: 'كغ' },
      ]
    }
  },

  // Admin bundle
  getAdminData: async () => {
    const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10)
    const { data: ordersData } = await supabase.from('orders').select('id, created_at').order('created_at', { ascending: false })
    const today = ordersData?.length ?? 127
    const thisHour = ordersData?.filter((o: any) => {
      const d = new Date(o.created_at)
      return (Date.now() - d.getTime()) < 3600000
    }).length ?? 18
    return {
      stats: {
        ordersToday: today,
        ordersThisHour: thisHour,
        activeTables: 9,
        totalTables: 15,
        revenue: 501100,
        revenueGrowth: 12,
        rating: 4.8,
      },
      notifications: (notifData ?? []).map(mapNotif),
      topItems: [
        { name: 'ساج',         count: 42, pct: 42, color: '#DCA95C' },
        { name: 'بيتزا',       count: 28, pct: 28, color: '#4CAF50' },
        { name: 'موك',         count: 18, pct: 18, color: '#378ADD' },
        { name: 'أخرى',        count: 12, pct: 12, color: '#E8A020' },
      ],
      hourlyVols: [2, 1, 3, 7, 20, 38, 55, 60, 48, 62, 45, 28, 18, 12, 8, 5, 3, 2, 5, 18, 42, 58, 62, 38],
      weeklySales: [
        { day: 'السبت',  val: 2.8 },
        { day: 'الجمعة', val: 3.2 },
        { day: 'الخميس', val: 2.4 },
        { day: 'الأربعاء', val: 3.6 },
        { day: 'الثلاثاء', val: 3.1 },
        { day: 'الاثنين', val: 4.2 },
        { day: 'الأحد',  val: 4.1 },
      ],
    }
  },

  // Menu CRUD
  addMenuItem: async (item: { name: string; price: number; category: string; emoji: string; description: string; hot?: boolean }): Promise<MenuItem> => {
    const { data, error } = await supabase.from('menu_items').insert({
      name: item.name, price: item.price, category: item.category,
      emoji: item.emoji, description: item.description, hot: item.hot ?? false,
    }).select().single()
    if (error) throw error
    return mapMenuItem(data)
  },

  updateMenuItem: async (id: number, updates: Partial<{ name: string; price: number; description: string; emoji: string; hot: boolean }>): Promise<MenuItem> => {
    const { data, error } = await supabase.from('menu_items').update(updates).eq('id', id).select().single()
    if (error) throw error
    return mapMenuItem(data)
  },

  deleteMenuItem: async (id: number): Promise<void> => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) throw error
  },

  // Sales data aggregated by day
  getSalesData: async (): Promise<{ day: string; val: number; orders: number }[]> => {
    const since = new Date()
    since.setDate(since.getDate() - 7)
    const { data } = await supabase.from('orders').select('created_at').gte('created_at', since.toISOString())
    if (!data || data.length === 0) {
      return [
        { day: 'السبت',    val: 280000, orders: 48 },
        { day: 'الجمعة',   val: 320000, orders: 62 },
        { day: 'الخميس',   val: 240000, orders: 41 },
        { day: 'الأربعاء', val: 360000, orders: 68 },
        { day: 'الثلاثاء', val: 310000, orders: 55 },
        { day: 'الاثنين',  val: 420000, orders: 78 },
        { day: 'الأحد',    val: 410000, orders: 74 },
      ]
    }
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const AVG_ORDER = 15000
    const grouped: Record<string, number> = {}
    for (const o of data) {
      const day = dayNames[new Date(o.created_at).getDay()]
      grouped[day] = (grouped[day] ?? 0) + 1
    }
    return Object.entries(grouped).map(([day, count]) => ({ day, val: count * AVG_ORDER, orders: count }))
  },

  // Orders since timestamp (for shift summaries)
  getOrdersSince: async (since: string): Promise<{ id: string; items: string; time: string }[]> => {
    const { data } = await supabase.from('orders').select('id, items, time, created_at').gte('created_at', since).order('created_at')
    return (data ?? []).map((r: any) => ({ id: r.id, items: r.items, time: r.time }))
  },

  // POS order
  placePosOrder: async (items: string, table: string, total: number): Promise<void> => {
    const id = `#${Date.now().toString().slice(-5)}`
    await supabase.from('orders').insert({ id, table_ref: table, items, time: nowStr(), status: 'new' })
    await supabase.from('notifications').insert({ table_ref: table.replace('T', ''), message: `POS طلب ${id} — ${total.toLocaleString()} د.ع`, time: 'الآن', color: '#DCA95C' })
  },
}

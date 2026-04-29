export interface MenuItem {
  id: number
  name: string
  desc: string
  price: number
  category: 'm' | 's' | 'd' | 'sw'
  emoji: string
  hot?: boolean
}

export interface CartItem {
  item: MenuItem
  qty: number
}

export interface KitchenOrder {
  id: string
  table: string
  items: string
  time: string
  status: 'new' | 'ready'
}

export interface Alert {
  id: number
  table: string
  type: string
  emoji: string
  time: string
}

export interface Reservation {
  id: number
  time: string
  table: string
  name: string
  confirmed: boolean
}

export interface QueueItem {
  id: string
  table: string
  items: string
  waiter: string
  status: 'serving' | 'assigned' | 'done'
}

export interface Table {
  n: number
  s: 'g' | 'e' | 'f'
}

export interface Offer {
  id: number
  title: string
  desc: string
  active: boolean
}

export interface AdminNotification {
  table: string
  message: string
  time: string
  color: string
}

export interface TopItem {
  name: string
  count: number
  pct: number
  color: string
}

export interface AdminStats {
  ordersToday: number
  ordersThisHour: number
  activeTables: number
  totalTables: number
  revenue: number
  revenueGrowth: number
  rating: number
}

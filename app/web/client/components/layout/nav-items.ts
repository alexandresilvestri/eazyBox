import {
  IconCalendarEvent,
  IconCalendarWeek,
  IconClipboardText,
  IconLayoutGrid,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'

export type NavItem = { to: string; label: string; icon: Icon }

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Painel', icon: IconLayoutGrid },
  { to: '/programacao', label: 'Programação', icon: IconClipboardText },
  { to: '/grade', label: 'Grade', icon: IconCalendarWeek },
  { to: '/sessoes', label: 'Sessões', icon: IconCalendarEvent },
  { to: '/membros', label: 'Membros', icon: IconUsers },
]

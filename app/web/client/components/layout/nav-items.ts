export type NavItem = {
  label: string
  path: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/' },
  { label: 'WODs', path: '/wods' },
  { label: 'Horários', path: '/horarios' },
  { label: 'Aulas', path: '/aulas' },
  { label: 'Clientes', path: '/clientes', adminOnly: true },
  { label: 'Coaches', path: '/coaches', adminOnly: true },
  { label: 'Check-ins', path: '/check-ins' },
  { label: 'Ajustes', path: '/ajustes' },
]

export const navFor = (isAdmin: boolean) =>
  NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly)

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: 'overview' | 'projects' | 'clients' | 'settings';
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { href: '/dashboard', label: 'Áttekintés', icon: 'overview' },
  { href: '/projects', label: 'Projektek', icon: 'projects' },
  { href: '/clients', label: 'Ügyfelek', icon: 'clients' },
  { href: '/settings', label: 'Beállítások', icon: 'settings' },
] as const;

export function isActiveNav(currentPath: string, href: string): boolean {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

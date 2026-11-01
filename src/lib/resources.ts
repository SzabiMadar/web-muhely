import type { WorkType } from './types';

export interface ResourcePreset {
  key: string;
  label: string;
  provider: string;
  appliesTo: WorkType[];
}

export const RESOURCE_PRESETS: readonly ResourcePreset[] = [
  { key: 'github', label: 'GitHub repository', provider: 'GitHub', appliesTo: ['new_site', 'redesign', 'small_change'] },
  { key: 'staging', label: 'Staging környezet', provider: 'Staging', appliesTo: ['new_site', 'redesign', 'small_change'] },
  { key: 'live', label: 'Éles oldal', provider: 'Live', appliesTo: ['new_site', 'redesign', 'small_change'] },
  { key: 'figma', label: 'Figma / design', provider: 'Figma', appliesTo: ['new_site', 'redesign'] },
  { key: 'drive', label: 'Google Drive / megosztott anyagok', provider: 'Google Drive', appliesTo: ['new_site', 'redesign', 'small_change'] },
  { key: 'hosting', label: 'Hosting admin', provider: 'Hosting', appliesTo: ['new_site', 'redesign', 'small_change'] },
  { key: 'dns', label: 'DNS / domain regisztrátor', provider: 'DNS', appliesTo: ['new_site', 'redesign', 'small_change'] },
  { key: 'analytics', label: 'Analytics / mérés', provider: 'Analytics', appliesTo: ['new_site', 'redesign'] },
  { key: 'cms', label: 'CMS admin', provider: 'CMS', appliesTo: ['new_site', 'redesign'] },
  { key: 'billing', label: 'Számlázó / ügyfélportál', provider: 'Egyéb', appliesTo: ['new_site', 'redesign', 'small_change'] },
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const FILE_BUCKET = 'project-files';

/** Engedélyezett fájltípusok a dossziéba — kiterjesztés + MIME. */
export const ALLOWED_FILE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'pdf',
  'txt', 'md', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'zip',
]);

export const ALLOWED_MIME_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf', 'text/plain', 'text/markdown', 'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed',
]);

export function validateProjectFile(file: { name: string; size: number; type: string }): string | null {
  if (file.size <= 0) return 'Válassz ki egy fájlt.';
  if (file.size > MAX_FILE_SIZE_BYTES) return 'A fájl legfeljebb 10 MB lehet.';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_FILE_EXTENSIONS.has(ext)) return `Nem támogatott fájltípus: .${ext}`;
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) return `Nem támogatott tartalomtípus: ${file.type}`;
  return null;
}

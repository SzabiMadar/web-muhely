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

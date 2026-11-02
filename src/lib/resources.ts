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

/**
 * Kiterjesztésenkénti fájlszabályok a dossziéhoz.
 * magic = elvárt fejléc-bájtok (fájlszignatúra); text = UTF-8 szövegellenőrzés.
 * Az SVG és más aktív tartalom az MVP-ben tiltva marad.
 */
export interface FileRule {
  mimes: string[];
  magic?: number[][];
  text?: boolean;
  requiredEntries?: string[];
}

export const FILE_RULES: Record<string, FileRule> = {
  png:  { mimes: ['image/png'], magic: [[0x89, 0x50, 0x4e, 0x47]] },
  jpg:  { mimes: ['image/jpeg'], magic: [[0xff, 0xd8, 0xff]] },
  jpeg: { mimes: ['image/jpeg'], magic: [[0xff, 0xd8, 0xff]] },
  webp: { mimes: ['image/webp'], magic: [[0x52, 0x49, 0x46, 0x46]] },
  gif:  { mimes: ['image/gif'], magic: [[0x47, 0x49, 0x46]] },
  pdf:  { mimes: ['application/pdf'], magic: [[0x25, 0x50, 0x44, 0x46]] },
  doc:  { mimes: ['application/msword'], magic: [[0xd0, 0xcf, 0x11, 0xe0]] },
  xls:  { mimes: ['application/vnd.ms-excel'], magic: [[0xd0, 0xcf, 0x11, 0xe0]] },
  docx: { mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], magic: [[0x50, 0x4b]], requiredEntries: ['[Content_Types].xml', 'word/document.xml'] },
  xlsx: { mimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], magic: [[0x50, 0x4b]], requiredEntries: ['[Content_Types].xml', 'xl/workbook.xml'] },
  txt:  { mimes: ['text/plain'], text: true },
  md:   { mimes: ['text/markdown', 'text/plain'], text: true },
  csv:  { mimes: ['text/csv', 'text/plain'], text: true },
};

export const ALLOWED_MIME_TYPES = new Set(
  Object.values(FILE_RULES).flatMap((rule) => rule.mimes),
);

const MAGIC_BYTES = 16;
const TEXT_SAMPLE_BYTES = 4096;
const CONTROL_CHARS_OK = new Set([0x09, 0x0a, 0x0d]);

function hasMagic(bytes: Uint8Array, signatures: number[][]): boolean {
  return signatures.some((sig) => sig.every((byte, i) => bytes[i] === byte));
}

export const FILE_ACCEPT = Object.keys(FILE_RULES).map((ext) => `.${ext}`).join(',');

/**
 * Minimális ZIP Central Directory-olvasó — csak szerkezet, inflate nélkül.
 * Így a "kitömörítési korlát" definíció szerint teljesül (nem tömörítünk ki);
 * a zip-bomb jelzést a deklarált uncompressed méretek korlátozása adja.
 */
const EOCD_SIG = 0x06054b50;
const CDIR_SIG = 0x02014b50;
const EOCD_MAX_SCAN = 22 + 0xffff;
const MAX_ZIP_ENTRIES = 512;
const MAX_ZIP_UNCOMPRESSED = 50 * 1024 * 1024;

function parseZipEntries(bytes: Uint8Array): Set<string> | null {
  if (bytes.length < 22) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const scanStart = Math.max(0, bytes.length - EOCD_MAX_SCAN);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= scanStart; i--) {
    if (view.getUint32(i, true) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) return null;
  const entryCount = view.getUint16(eocd + 10, true);
  if (entryCount === 0 || entryCount > MAX_ZIP_ENTRIES) return null;
  let pos = view.getUint32(eocd + 16, true);
  const names = new Set<string>();
  const decoder = new TextDecoder();
  let uncompressedTotal = 0;
  for (let i = 0; i < entryCount; i++) {
    if (pos + 46 > bytes.length || view.getUint32(pos, true) !== CDIR_SIG) return null;
    uncompressedTotal += view.getUint32(pos + 24, true);
    if (uncompressedTotal > MAX_ZIP_UNCOMPRESSED) return null;
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const nameStart = pos + 46;
    if (nameStart + nameLen > bytes.length) return null;
    names.add(decoder.decode(bytes.subarray(nameStart, nameStart + nameLen)));
    pos = nameStart + nameLen + extraLen + commentLen;
  }
  return names;
}

function isSafeUtf8Text(bytes: Uint8Array): boolean {
  try {
    const sample = bytes.slice(0, TEXT_SAMPLE_BYTES);
    const text = new TextDecoder('utf-8', { fatal: true }).decode(sample);
    for (const ch of text) {
      const code = ch.codePointAt(0)!;
      if (code < 0x20 && !CONTROL_CHARS_OK.has(code)) return false;
      if (code === 0x7f) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function validateProjectFile(file: File): Promise<string | null> {
  if (file.size <= 0) return 'Válassz ki egy fájlt.';
  if (file.size > MAX_FILE_SIZE_BYTES) return 'A fájl legfeljebb 10 MB lehet.';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const rule = FILE_RULES[ext];
  if (!rule) return `Nem támogatott fájltípus: .${ext}`;
  if (!file.type) return 'Hiányzik a fájl tartalomtípusa (MIME).';
  if (!rule.mimes.includes(file.type)) return `A .${ext} fájlhoz nem ${file.type} tartalomtípus tartozik.`;
  const head = new Uint8Array(await file.slice(0, MAGIC_BYTES).arrayBuffer());
  if (rule.magic && !hasMagic(head, rule.magic)) {
    return 'A fájl tartalma nem felel meg a megadott típusnak.';
  }
  if (rule.requiredEntries) {
    const entries = parseZipEntries(new Uint8Array(await file.arrayBuffer()));
    if (!entries || !rule.requiredEntries.every((entry) => entries.has(entry))) {
      return 'A fájl tartalma nem felel meg a megadott típusnak.';
    }
  }
  if (rule.text) {
    const sample = new Uint8Array(await file.slice(0, TEXT_SAMPLE_BYTES).arrayBuffer());
    if (!isSafeUtf8Text(sample)) return 'A szöveges fájl tartalma hibás vagy nem UTF-8.';
  }
  return null;
}

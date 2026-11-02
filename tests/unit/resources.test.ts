import { describe, expect, it } from 'vitest';
import { validateProjectFile, MAX_FILE_SIZE_BYTES } from '../../src/lib/resources';

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const OLE = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const ZIP = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const MZ = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);
const txt = (s: string) => new TextEncoder().encode(s);

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

const crc32 = (b: Uint8Array) => {
  let c = 0xffffffff;
  for (const x of b) c = CRC_TABLE[(c ^ x) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function buildZip(entries: { name: string; data?: Uint8Array }[]): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const e of entries) {
    const name = enc.encode(e.name);
    const data = e.data ?? new Uint8Array(0);
    const crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(8, 0, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true);
    lh.setUint32(22, data.length, true);
    lh.setUint16(26, name.length, true);
    parts.push(new Uint8Array(lh.buffer), name, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint16(10, 0, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true);
    ch.setUint32(24, data.length, true);
    ch.setUint16(28, name.length, true);
    ch.setUint32(42, offset, true);
    centrals.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdStart = offset;
  const cdParts: Uint8Array[] = [];
  let cdSize = 0;
  for (const c of centrals) { cdParts.push(c); cdSize += c.length; }
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(8, entries.length, true);
  eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, cdSize, true);
  eocd.setUint32(16, cdStart, true);
  const out = new Uint8Array(offset + cdSize + 22);
  let p = 0;
  for (const part of [...parts, ...cdParts, new Uint8Array(eocd.buffer)]) {
    out.set(part, p);
    p += part.length;
  }
  return out;
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const f = (name: string, body: Uint8Array<ArrayBuffer> | string, type: string) =>
  new File([typeof body === 'string' ? txt(body) : body], name, { type });

describe('validateProjectFile', () => {
  it('támogatott típusok valódi tartalommal átmennek', async () => {
    expect(await validateProjectFile(f('a.pdf', PDF, 'application/pdf'))).toBeNull();
    expect(await validateProjectFile(f('a.png', PNG, 'image/png'))).toBeNull();
    expect(await validateProjectFile(f('a.doc', OLE, 'application/msword'))).toBeNull();
    expect(await validateProjectFile(f('a.docx', ZIP, DOCX_MIME))).toContain('tartalma');
    const noMainDoc = buildZip([{ name: '[Content_Types].xml' }]);
    expect(await validateProjectFile(f('a.docx', noMainDoc, DOCX_MIME))).toContain('tartalma');
    const wrongMain = buildZip([{ name: '[Content_Types].xml' }, { name: 'word/document.xml' }]);
    expect(await validateProjectFile(f('a.xlsx', wrongMain, XLSX_MIME))).toContain('tartalma');
    const truncated = buildZip([{ name: '[Content_Types].xml' }]).slice(0, 20);
    expect(await validateProjectFile(f('a.docx', truncated, DOCX_MIME))).toContain('tartalma');
    const many = buildZip(Array.from({ length: 513 }, (_, i) => ({ name: `f${i}` })));
    expect(await validateProjectFile(f('a.docx', many, DOCX_MIME))).toContain('tartalma');
    const docx = buildZip([{ name: '[Content_Types].xml' }, { name: 'word/document.xml' }]);
    expect(await validateProjectFile(f('a.docx', docx, DOCX_MIME))).toBeNull();
    const xlsx = buildZip([{ name: '[Content_Types].xml' }, { name: 'xl/workbook.xml' }]);
    expect(await validateProjectFile(f('a.xlsx', xlsx, XLSX_MIME))).toBeNull();
    expect(await validateProjectFile(f('a.txt', 'ügyfél brief\nmásodik sor', 'text/plain'))).toBeNull();
    expect(await validateProjectFile(f('a.md', '# Cím', 'text/markdown'))).toBeNull();
    expect(await validateProjectFile(f('a.csv', 'a;b\n1;2', 'text/csv'))).toBeNull();
  });
  it('kiterjesztés–MIME eltérés tiltott', async () => {
    expect(await validateProjectFile(f('a.pdf', PDF, 'image/png'))).toContain('tartalomtípus');
    expect(await validateProjectFile(f('a.png', PNG, 'application/pdf'))).toContain('tartalomtípus');
  });
  it('hiányzó MIME-típus tiltott', async () => {
    expect(await validateProjectFile(f('a.pdf', PDF, ''))).toContain('MIME');
  });
  it('hamis tartalom tiltott (álcázott exe / véletlen bájtok)', async () => {
    expect(await validateProjectFile(f('a.pdf', MZ, 'application/pdf'))).toContain('tartalma');
    expect(await validateProjectFile(f('a.txt', PNG, 'text/plain'))).toContain('UTF-8');
  });
  it('SVG és aktív/végrehajtható formátumok tiltottak', async () => {
    expect(await validateProjectFile(f('a.svg', '<svg/>', 'image/svg+xml'))).toContain('svg');
    expect(await validateProjectFile(f('a.exe', MZ, 'application/x-msdownload'))).toContain('exe');
    expect(await validateProjectFile(f('a.html', '<html/>', 'text/html'))).toContain('html');
    expect(await validateProjectFile(f('a.zip', ZIP, 'application/zip'))).toContain('zip');
  });
  it('méretkorlát és üres fájl', async () => {
    expect(await validateProjectFile(f('a.pdf', new Uint8Array(0), 'application/pdf'))).toContain('Válassz');
    const big = new File([new Uint8Array(MAX_FILE_SIZE_BYTES + 1)], 'a.pdf', { type: 'application/pdf' });
    expect(await validateProjectFile(big)).toContain('10 MB');
  });
});

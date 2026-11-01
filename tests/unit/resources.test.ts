import { describe, expect, it } from 'vitest';
import { validateProjectFile, MAX_FILE_SIZE_BYTES } from '../../src/lib/resources';

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const OLE = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const ZIP = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const MZ = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);
const txt = (s: string) => new TextEncoder().encode(s);

const f = (name: string, body: Uint8Array<ArrayBuffer> | string, type: string) =>
  new File([typeof body === 'string' ? txt(body) : body], name, { type });

describe('validateProjectFile', () => {
  it('támogatott típusok valódi tartalommal átmennek', async () => {
    expect(await validateProjectFile(f('a.pdf', PDF, 'application/pdf'))).toBeNull();
    expect(await validateProjectFile(f('a.png', PNG, 'image/png'))).toBeNull();
    expect(await validateProjectFile(f('a.doc', OLE, 'application/msword'))).toBeNull();
    expect(await validateProjectFile(f('a.xlsx', ZIP, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))).toBeNull();
    expect(await validateProjectFile(f('a.zip', ZIP, 'application/zip'))).toBeNull();
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
  });
  it('méretkorlát és üres fájl', async () => {
    expect(await validateProjectFile(f('a.pdf', new Uint8Array(0), 'application/pdf'))).toContain('Válassz');
    const big = new File([new Uint8Array(MAX_FILE_SIZE_BYTES + 1)], 'a.pdf', { type: 'application/pdf' });
    expect(await validateProjectFile(big)).toContain('10 MB');
  });
});

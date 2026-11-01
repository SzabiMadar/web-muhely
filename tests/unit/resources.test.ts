import { describe, expect, it } from 'vitest';
import { validateProjectFile, MAX_FILE_SIZE_BYTES } from '../../src/lib/resources';

const f = (name: string, size = 100, type = 'application/pdf') => ({ name, size, type });

describe('validateProjectFile', () => {
  it('engedélyezett típusok', () => {
    expect(validateProjectFile(f('a.pdf'))).toBeNull();
    expect(validateProjectFile(f('b.png', 100, 'image/png'))).toBeNull();
    expect(validateProjectFile(f('c.md', 100, 'text/markdown'))).toBeNull();
    expect(validateProjectFile(f('d.zip', 100, 'application/zip'))).toBeNull();
  });
  it('üres és túlméretes fájl', () => {
    expect(validateProjectFile(f('a.pdf', 0))).toContain('Válassz');
    expect(validateProjectFile(f('a.pdf', MAX_FILE_SIZE_BYTES + 1))).toContain('10 MB');
  });
  it('tiltott kiterjesztés és MIME', () => {
    expect(validateProjectFile(f('a.exe', 100, 'application/x-msdownload'))).toContain('.exe');
    expect(validateProjectFile(f('a.sh', 100, 'text/x-sh'))).toContain('.sh');
    expect(validateProjectFile(f('a.html', 100, 'text/html'))).toContain('.html');
    expect(validateProjectFile(f('a.pdf', 100, 'application/x-elf'))).toContain('application/x-elf');
  });
});

import { matchesDeclaredFileSignature } from '../file-signature';

describe('matchesDeclaredFileSignature', () => {
  it('accepts a buffer starting with real PDF magic bytes for application/pdf', () => {
    const buffer = Buffer.from('%PDF-1.4\n%rest of a fake pdf');
    expect(matchesDeclaredFileSignature(buffer, 'application/pdf')).toBe(true);
  });

  it('accepts a buffer starting with real PNG magic bytes for image/png', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    expect(matchesDeclaredFileSignature(buffer, 'image/png')).toBe(true);
  });

  it('accepts a buffer starting with real JPEG magic bytes for image/jpeg', () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(matchesDeclaredFileSignature(buffer, 'image/jpeg')).toBe(true);
  });

  it('rejects arbitrary bytes claiming to be a PDF', () => {
    const buffer = Buffer.from('just some arbitrary text, not a real PDF');
    expect(matchesDeclaredFileSignature(buffer, 'application/pdf')).toBe(false);
  });

  it('rejects a PNG declared as a JPEG (real file, wrong declared type)', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(matchesDeclaredFileSignature(buffer, 'image/jpeg')).toBe(false);
  });

  it('rejects a buffer shorter than the expected signature rather than throwing', () => {
    const buffer = Buffer.from([0x25, 0x50]); // truncated %PD
    expect(matchesDeclaredFileSignature(buffer, 'application/pdf')).toBe(false);
  });

  it('rejects an unrecognized declared content type rather than defaulting to true', () => {
    const buffer = Buffer.from('%PDF-1.4');
    expect(matchesDeclaredFileSignature(buffer, 'application/octet-stream')).toBe(false);
  });
});

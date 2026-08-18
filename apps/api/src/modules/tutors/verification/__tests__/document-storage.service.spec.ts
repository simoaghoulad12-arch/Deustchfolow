import { LocalDocumentStorageProvider } from '../document-storage.service';

describe('LocalDocumentStorageProvider', () => {
  it('round-trips bytes through save/read via a generated opaque storage key', async () => {
    const provider = new LocalDocumentStorageProvider();
    const original = Buffer.from('test document bytes');

    const { storageKey } = await provider.save(original);
    expect(storageKey).toMatch(/^[0-9a-f-]{36}$/);

    const read = await provider.read(storageKey);
    expect(read).not.toBeNull();
    expect(read?.equals(original)).toBe(true);
  });

  it('returns null for a storage key that does not exist', async () => {
    const provider = new LocalDocumentStorageProvider();

    const result = await provider.read('00000000-0000-0000-0000-000000000000');

    expect(result).toBeNull();
  });
});

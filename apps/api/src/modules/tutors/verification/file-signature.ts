/**
 * Verifies a file's actual byte signature matches its declared MIME
 * type — a client-supplied `contentType` string alone (checked only
 * against `ALLOWED_CONTENT_TYPES` in the DTO) proves nothing about what
 * bytes were actually uploaded. Without this, a tutor could upload
 * arbitrary bytes labeled `application/pdf`, which would later be
 * served `inline` with that declared Content-Type to an admin reviewing
 * verification documents (Phase 6.5 audit finding).
 *
 * Deliberately a minimal, dependency-free signature check (not a full
 * parser) — enough to catch a mislabeled/arbitrary upload without
 * pulling in a file-type-sniffing library for three known formats.
 */
const SIGNATURES: Record<string, readonly number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/jpeg': [0xff, 0xd8, 0xff],
};

export function matchesDeclaredFileSignature(buffer: Buffer, declaredContentType: string): boolean {
  const signature = SIGNATURES[declaredContentType];
  if (!signature) return false;
  if (buffer.byteLength < signature.length) return false;
  return signature.every((byte, index) => buffer[index] === byte);
}

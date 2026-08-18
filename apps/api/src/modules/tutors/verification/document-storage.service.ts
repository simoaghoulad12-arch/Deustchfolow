import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';

/**
 * Storage abstraction for tutor verification documents (spec section 3:
 * "privater Bucket, signierte URLs") — same interface-first pattern as
 * AIProvider (Phase 4): swap this implementation for a real S3-compatible
 * provider without touching TutorVerificationService. Never a public
 * bucket/URL — every read goes through TutorVerificationService's own
 * ownership/admin authorization first, the same way every other
 * authenticated endpoint in this API works (a fresh ~60s service token
 * per request already IS the "short-lived signed access" this local
 * provider needs; a literal query-string-signed-URL scheme is deferred
 * until a real object store is introduced, see ADR).
 */
export interface DocumentStorageProvider {
  save(buffer: Buffer): Promise<{ storageKey: string }>;
  read(storageKey: string): Promise<Buffer | null>;
}

const STORAGE_DIR = join(process.cwd(), 'var', 'tutor-documents');

/**
 * Local-filesystem dev implementation. Never reachable via any static
 * file server — NestJS does not serve `var/` — the only way to a file's
 * bytes is through TutorVerificationService's authorized read path.
 */
@Injectable()
export class LocalDocumentStorageProvider implements DocumentStorageProvider {
  async save(buffer: Buffer): Promise<{ storageKey: string }> {
    await mkdir(STORAGE_DIR, { recursive: true });
    const storageKey = randomUUID();
    await writeFile(join(STORAGE_DIR, storageKey), buffer);
    return { storageKey };
  }

  async read(storageKey: string): Promise<Buffer | null> {
    try {
      return await readFile(join(STORAGE_DIR, storageKey));
    } catch {
      return null;
    }
  }
}

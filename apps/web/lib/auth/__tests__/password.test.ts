import { hashPassword, verifyPassword, passwordSchema } from '../password';

describe('password hashing', () => {
  it('never stores the plaintext password', async () => {
    const hash = await hashPassword('correct-horse-1');
    expect(hash).not.toContain('correct-horse-1');
    expect(hash.startsWith('$2')).toBe(true); // bcrypt hash format
  });

  it('verifies a matching password', async () => {
    const hash = await hashPassword('correct-horse-1');
    expect(await verifyPassword('correct-horse-1', hash)).toBe(true);
  });

  it('rejects a non-matching password', async () => {
    const hash = await hashPassword('correct-horse-1');
    expect(await verifyPassword('wrong-password-1', hash)).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('rejects passwords shorter than 10 characters', () => {
    expect(passwordSchema.safeParse('short1').success).toBe(false);
  });

  it('rejects passwords without a number', () => {
    expect(passwordSchema.safeParse('onlylettersnodigits').success).toBe(false);
  });

  it('rejects passwords without a letter', () => {
    expect(passwordSchema.safeParse('1234567890').success).toBe(false);
  });

  it('accepts a password meeting all rules', () => {
    expect(passwordSchema.safeParse('correct-horse-1').success).toBe(true);
  });
});

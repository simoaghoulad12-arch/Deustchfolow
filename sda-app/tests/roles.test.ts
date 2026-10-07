import { describe, expect, it } from 'vitest';
import { parseInvite } from '../lib/roles';

describe('Einladungsformular', () => {
  it('bereinigt gültige Eingaben', () => {
    expect(
      parseInvite({ email: '  Test@Example.org ', fullName: ' Test Person ', role: 'teacher' }),
    ).toEqual({
      email: 'test@example.org',
      fullName: 'Test Person',
      role: 'teacher',
    });
  });

  it('lehnt ungültige E-Mail, fehlenden Namen und unbekannte Rollen ab', () => {
    expect(parseInvite({ email: 'kein-at', fullName: 'X', role: 'teacher' })).toHaveProperty(
      'error',
    );
    expect(parseInvite({ email: 'a@b.de', fullName: '  ', role: 'teacher' })).toHaveProperty(
      'error',
    );
    expect(parseInvite({ email: 'a@b.de', fullName: 'X', role: 'student' })).toHaveProperty(
      'error',
    );
    expect(parseInvite({ email: 'a@b.de', fullName: 'X', role: 'superadmin' })).toHaveProperty(
      'error',
    );
    expect(
      parseInvite({ email: 'a@b.de', fullName: 'X'.repeat(121), role: 'admin' }),
    ).toHaveProperty('error');
  });
});

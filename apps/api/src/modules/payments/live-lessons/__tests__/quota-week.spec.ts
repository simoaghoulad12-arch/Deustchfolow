import { getQuotaWeekStart } from '../quota-week';

describe('getQuotaWeekStart', () => {
  it('returns the same instant for a date exactly at Monday 00:00 UTC', () => {
    const monday = new Date('2026-08-24T00:00:00.000Z');

    expect(getQuotaWeekStart(monday)).toEqual(monday);
  });

  it('returns the preceding Monday for a date mid-week', () => {
    const wednesday = new Date('2026-08-26T14:30:00.000Z');

    expect(getQuotaWeekStart(wednesday)).toEqual(new Date('2026-08-24T00:00:00.000Z'));
  });

  it('returns the same-week Monday for a Sunday (ISO week ends Sunday)', () => {
    const sunday = new Date('2026-08-30T23:59:59.000Z');

    expect(getQuotaWeekStart(sunday)).toEqual(new Date('2026-08-24T00:00:00.000Z'));
  });

  it('is unaffected by the Central European DST transition — always operates in UTC', () => {
    // 2026-03-29 is the CET->CEST spring-forward Sunday in Germany; a
    // naive local-timezone week calculation could shift by an hour here.
    const dstSunday = new Date('2026-03-29T10:00:00.000Z');

    expect(getQuotaWeekStart(dstSunday)).toEqual(new Date('2026-03-23T00:00:00.000Z'));
  });

  it('crosses a year boundary correctly', () => {
    const newYearsDay = new Date('2027-01-01T05:00:00.000Z'); // a Friday

    expect(getQuotaWeekStart(newYearsDay)).toEqual(new Date('2026-12-28T00:00:00.000Z'));
  });
});

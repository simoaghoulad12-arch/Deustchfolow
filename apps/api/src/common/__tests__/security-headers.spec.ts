import type { INestApplication } from '@nestjs/common';
import { applySecurityHeaders } from '../security-headers';

describe('applySecurityHeaders', () => {
  it('registers middleware that sets X-Content-Type-Options: nosniff on every response', () => {
    const use = jest.fn();
    const app = { use } as unknown as INestApplication;

    applySecurityHeaders(app);

    expect(use).toHaveBeenCalledTimes(1);
    const middleware = use.mock.calls[0][0] as (req: unknown, res: { setHeader: jest.Mock }, next: jest.Mock) => void;

    const res = { setHeader: jest.fn() };
    const next = jest.fn();
    middleware({}, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(next).toHaveBeenCalled();
  });
});

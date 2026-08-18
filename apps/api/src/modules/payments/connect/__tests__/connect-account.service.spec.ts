import { NotFoundException } from '@nestjs/common';
import { TutorConnectAccountStatus } from '@deutschflow/types';
import { ConnectAccountService, deriveConnectStatus } from '../connect-account.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { StripeService } from '../../stripe/stripe.service';

const originalAppUrl = process.env.APP_URL;
beforeEach(() => {
  process.env.APP_URL = 'http://localhost:3000';
});
afterAll(() => {
  if (originalAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = originalAppUrl;
});

const existingAccount = {
  tutorId: 'tutor-1',
  stripeAccountId: 'acct_existing',
  status: TutorConnectAccountStatus.ONBOARDING_INCOMPLETE,
  chargesEnabled: false,
  payoutsEnabled: false,
  detailsSubmitted: false,
};

function buildPrismaMock(overrides?: {
  tutorConnectedAccount?: Partial<Record<string, jest.Mock>>;
  user?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      tutorConnectedAccount: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ ...existingAccount, stripeAccountId: 'acct_new' }),
        update: jest.fn().mockResolvedValue({}),
        ...overrides?.tutorConnectedAccount,
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ email: 'tutor@example.com' }),
        ...overrides?.user,
      },
    },
  } as unknown as PrismaService;
}

function buildStripeMock(overrides?: { accountsCreate?: jest.Mock; accountLinksCreate?: jest.Mock }) {
  return {
    client: {
      accounts: { create: overrides?.accountsCreate ?? jest.fn().mockResolvedValue({ id: 'acct_new' }) },
      accountLinks: {
        create: overrides?.accountLinksCreate ?? jest.fn().mockResolvedValue({ url: 'https://connect.stripe.com/setup/test' }),
      },
    },
  } as unknown as StripeService;
}

describe('deriveConnectStatus (pure function)', () => {
  it('is ENABLED once both charges and payouts are enabled', () => {
    expect(deriveConnectStatus(true, true, true)).toBe(TutorConnectAccountStatus.ENABLED);
  });

  it('is RESTRICTED when details are submitted but not yet fully enabled', () => {
    expect(deriveConnectStatus(false, false, true)).toBe(TutorConnectAccountStatus.RESTRICTED);
    expect(deriveConnectStatus(true, false, true)).toBe(TutorConnectAccountStatus.RESTRICTED);
  });

  it('is ONBOARDING_INCOMPLETE when details have not been submitted yet', () => {
    expect(deriveConnectStatus(false, false, false)).toBe(TutorConnectAccountStatus.ONBOARDING_INCOMPLETE);
  });
});

describe('ConnectAccountService', () => {
  describe('getOrCreateForTutor', () => {
    it('returns the existing account without calling Stripe when one already exists', async () => {
      const prisma = buildPrismaMock({
        tutorConnectedAccount: { findUnique: jest.fn().mockResolvedValue(existingAccount) },
      });
      const stripe = buildStripeMock();
      const service = new ConnectAccountService(prisma, stripe);

      const result = await service.getOrCreateForTutor('tutor-1');

      expect(result).toEqual({ stripeAccountId: 'acct_existing', status: TutorConnectAccountStatus.ONBOARDING_INCOMPLETE });
      expect(stripe.client.accounts.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a nonexistent tutor rather than calling Stripe', async () => {
      const prisma = buildPrismaMock({ user: { findUnique: jest.fn().mockResolvedValue(null) } });
      const stripe = buildStripeMock();
      const service = new ConnectAccountService(prisma, stripe);

      await expect(service.getOrCreateForTutor('nope')).rejects.toBeInstanceOf(NotFoundException);
      expect(stripe.client.accounts.create).not.toHaveBeenCalled();
    });

    it('creates a Stripe Express account for Germany with the requested capabilities, then persists the local row', async () => {
      const createSpy = jest.fn().mockResolvedValue({ id: 'acct_new' });
      const prisma = buildPrismaMock();
      const stripe = buildStripeMock({ accountsCreate: createSpy });
      const service = new ConnectAccountService(prisma, stripe);

      await service.getOrCreateForTutor('tutor-1');

      expect(createSpy).toHaveBeenCalledWith({
        type: 'express',
        country: 'DE',
        email: 'tutor@example.com',
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      });
      expect(prisma.client.tutorConnectedAccount.create).toHaveBeenCalledWith({
        data: { tutorId: 'tutor-1', stripeAccountId: 'acct_new' },
      });
    });
  });

  describe('createOnboardingLink', () => {
    it('creates an account_onboarding link pointed at the web app', async () => {
      const linkSpy = jest.fn().mockResolvedValue({ url: 'https://connect.stripe.com/setup/test' });
      const prisma = buildPrismaMock({
        tutorConnectedAccount: { findUnique: jest.fn().mockResolvedValue(existingAccount) },
      });
      const stripe = buildStripeMock({ accountLinksCreate: linkSpy });
      const service = new ConnectAccountService(prisma, stripe);

      const result = await service.createOnboardingLink('tutor-1');

      expect(linkSpy).toHaveBeenCalledWith(
        expect.objectContaining({ account: 'acct_existing', type: 'account_onboarding' }),
      );
      expect(result).toEqual({ url: 'https://connect.stripe.com/setup/test' });
    });
  });

  describe('upsertFromStripeAccount', () => {
    it('logs and skips for an unknown Stripe account id, never throwing', async () => {
      const prisma = buildPrismaMock({ tutorConnectedAccount: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new ConnectAccountService(prisma, buildStripeMock());

      await service.upsertFromStripeAccount({
        stripeAccountId: 'acct_unknown',
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
      });

      expect(prisma.client.tutorConnectedAccount.update).not.toHaveBeenCalled();
    });

    it('updates capability flags and derives the correct status', async () => {
      const prisma = buildPrismaMock({
        tutorConnectedAccount: { findUnique: jest.fn().mockResolvedValue(existingAccount) },
      });
      const service = new ConnectAccountService(prisma, buildStripeMock());

      await service.upsertFromStripeAccount({
        stripeAccountId: 'acct_existing',
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
      });

      expect(prisma.client.tutorConnectedAccount.update).toHaveBeenCalledWith({
        where: { stripeAccountId: 'acct_existing' },
        data: {
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true,
          status: TutorConnectAccountStatus.ENABLED,
        },
      });
    });
  });

  describe('isBookable', () => {
    it('is false when the tutor has no Connect account at all', async () => {
      const prisma = buildPrismaMock();
      const service = new ConnectAccountService(prisma, buildStripeMock());

      expect(await service.isBookable('tutor-1')).toBe(false);
    });

    it('is false while status is not ENABLED', async () => {
      const prisma = buildPrismaMock({
        tutorConnectedAccount: { findUnique: jest.fn().mockResolvedValue(existingAccount) },
      });
      const service = new ConnectAccountService(prisma, buildStripeMock());

      expect(await service.isBookable('tutor-1')).toBe(false);
    });

    it('is true once status is ENABLED', async () => {
      const prisma = buildPrismaMock({
        tutorConnectedAccount: {
          findUnique: jest.fn().mockResolvedValue({ ...existingAccount, status: TutorConnectAccountStatus.ENABLED }),
        },
      });
      const service = new ConnectAccountService(prisma, buildStripeMock());

      expect(await service.isBookable('tutor-1')).toBe(true);
    });
  });

  describe('getStatusForTutor', () => {
    it('returns a safe default for a tutor who has never started onboarding', async () => {
      const prisma = buildPrismaMock();
      const service = new ConnectAccountService(prisma, buildStripeMock());

      const result = await service.getStatusForTutor('tutor-1');

      expect(result).toEqual({
        status: TutorConnectAccountStatus.ONBOARDING_INCOMPLETE,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    });
  });
});

import { SubscriptionPlan, type AuthenticatedUser } from '@deutschflow/types';
import { LiveLessonQuotaController } from '../live-lesson-quota.controller';
import type { EntitlementsService } from '../../../entitlements/entitlements.service';
import type { LiveLessonQuotaService } from '../live-lesson-quota.service';

const user: AuthenticatedUser = { id: 'user-1', role: 'STUDENT' } as AuthenticatedUser;

describe('LiveLessonQuotaController', () => {
  it('resolves the plan itself and returns the quota summary scoped to the caller', async () => {
    const entitlements = { getActivePlan: jest.fn().mockResolvedValue(SubscriptionPlan.PREMIUM) } as unknown as EntitlementsService;
    const summary = { weekStart: new Date('2026-08-24T00:00:00.000Z'), totalMinutes: 60, usedMinutes: 30, remainingMinutes: 30 };
    const liveLessonQuota = { getQuotaSummary: jest.fn().mockResolvedValue(summary) } as unknown as LiveLessonQuotaService;
    const controller = new LiveLessonQuotaController(entitlements, liveLessonQuota);

    const result = await controller.getMyQuota(user);

    expect(entitlements.getActivePlan).toHaveBeenCalledWith('user-1');
    expect(liveLessonQuota.getQuotaSummary).toHaveBeenCalledWith('user-1', SubscriptionPlan.PREMIUM);
    expect(result).toEqual({ plan: SubscriptionPlan.PREMIUM, ...summary });
  });
});

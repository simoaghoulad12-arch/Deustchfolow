import type { AuthenticatedUser } from '@deutschflow/types';
import { AiUsageController } from '../usage.controller';
import type { AiUsageService } from '../../usage/ai-usage.service';

const user: AuthenticatedUser = { id: 'user-1', role: 'STUDENT' } as AuthenticatedUser;

describe('AiUsageController', () => {
  it('delegates to AiUsageService.getUsageSummary, scoped to the caller', async () => {
    const summary = { limits: { tutorMessagesPerDay: 5, writingCorrectionsPerDay: 3 }, usedToday: { tutor: 1, writing_correction: 0 } };
    const aiUsage = { getUsageSummary: jest.fn().mockResolvedValue(summary) } as unknown as AiUsageService;
    const controller = new AiUsageController(aiUsage);

    const result = await controller.getMyUsage(user);

    expect(aiUsage.getUsageSummary).toHaveBeenCalledWith('user-1');
    expect(result).toBe(summary);
  });
});

import { Injectable, NotFoundException } from '@nestjs/common';
import { GERMANY_PATH_STEP_ORDER, type GermanyPathStep } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { SetGermanyGoalDto } from '../dto/set-germany-goal.dto';
import type { SetGermanyStepDto } from '../dto/set-germany-step.dto';

/**
 * "Wo bin ich auf meinem Weg nach Deutschland?" (spec section 11) — a
 * fixed, ordered step sequence (GERMANY_PATH_STEP_ORDER), never a
 * workflow/rules engine (see ADR section 5). A user's currentStep
 * position in that fixed order is the entire state machine.
 */
@Injectable()
export class GermanyPathService {
  constructor(private readonly prisma: PrismaService) {}

  /** Creates the path on first goal selection, or just updates the goal on an existing one — never resets progress (currentStep) on a goal change. */
  async setGoal(userId: string, dto: SetGermanyGoalDto) {
    return this.prisma.client.germanyPath.upsert({
      where: { userId },
      create: { userId, goalType: dto.goalType },
      update: { goalType: dto.goalType },
    });
  }

  async setStep(userId: string, dto: SetGermanyStepDto) {
    const path = await this.prisma.client.germanyPath.findUnique({ where: { userId } });
    if (!path) {
      throw new NotFoundException('Set a Germany goal before tracking path progress.');
    }
    return this.prisma.client.germanyPath.update({
      where: { userId },
      data: { currentStep: dto.step },
    });
  }

  async getOwnPath(userId: string) {
    const path = await this.prisma.client.germanyPath.findUnique({ where: { userId } });
    if (!path) {
      return null;
    }
    return { ...path, ...this.describeSteps(path.currentStep) };
  }

  /** Splits the fixed step order into done/current/upcoming relative to currentStep — the "✓ / → / ○" view from spec section 11. */
  describeSteps(currentStep: GermanyPathStep) {
    const currentIndex = GERMANY_PATH_STEP_ORDER.indexOf(currentStep);
    const steps = GERMANY_PATH_STEP_ORDER.map((step, index) => ({
      step,
      status: index < currentIndex ? ('DONE' as const) : index === currentIndex ? ('CURRENT' as const) : ('UPCOMING' as const),
    }));
    const nextStep = GERMANY_PATH_STEP_ORDER[currentIndex + 1] ?? null;
    return { steps, nextStep };
  }
}

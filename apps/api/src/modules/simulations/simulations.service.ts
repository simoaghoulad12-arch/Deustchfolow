import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { QuerySimulationsDto } from './dto/query-simulations.dto';

/**
 * Real-Life Simulation catalog (spec section 15) — content only, browse
 * and detail. Starting a session (i.e. actually talking to the AI in
 * character) goes through the existing TutorService.sendMessage with a
 * simulationId, not through this service — see ADR section 4.
 */
@Injectable()
export class SimulationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(query: QuerySimulationsDto) {
    return this.prisma.client.simulation.findMany({
      where: {
        isActive: true,
        ...(query.category ? { category: query.category } : {}),
        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(simulationId: string) {
    const simulation = await this.prisma.client.simulation.findUnique({ where: { id: simulationId } });
    if (!simulation || !simulation.isActive) {
      throw new NotFoundException('Simulation not found.');
    }
    return simulation;
  }
}

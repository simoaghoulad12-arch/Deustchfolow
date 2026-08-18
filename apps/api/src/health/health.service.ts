import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { HealthResponseDto } from '../common/dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger('Health');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * `status`/the HTTP code stay a pure liveness signal ("the process is
   * up, don't restart it") — never gated on the database, so this keeps
   * responding 200 even if Postgres is briefly unreachable (the correct
   * behavior for a liveness probe: a DB blip shouldn't cause a needless
   * process restart). `database` is the separate, honest readiness
   * signal — a real `SELECT 1`, never assumed healthy just because the
   * process is running (Phase 6.5 audit finding: this used to claim "DB
   * check lands later" even though PrismaModule was already wired in).
   */
  async check(): Promise<HealthResponseDto> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: await this.checkDatabase(),
    };
  }

  private async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.client.$queryRaw`SELECT 1`;
      return 'ok';
    } catch (error) {
      this.logger.error(JSON.stringify({ event: 'health_database_check_failed', message: (error as Error).message }));
      return 'error';
    }
  }
}

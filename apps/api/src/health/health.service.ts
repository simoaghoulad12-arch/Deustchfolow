import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from '../common/dto/health-response.dto';

@Injectable()
export class HealthService {
  /**
   * Reports that the process is up and serving requests.
   * Intentionally does not check the database — that lands once the
   * database module is wired into the API in a later phase.
   */
  check(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

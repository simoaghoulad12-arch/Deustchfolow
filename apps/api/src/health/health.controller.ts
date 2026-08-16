import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResponseDto } from '../common/dto/health-response.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): HealthResponseDto {
    return this.healthService.check();
  }
}

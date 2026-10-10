import { Controller, Get } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@Controller('live/progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.progress.overview(user.id);
  }
}

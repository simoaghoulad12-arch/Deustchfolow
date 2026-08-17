import { Controller, Get } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@Controller('me/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /**
   * Always the caller's own progress — `@CurrentUser()` only, never a
   * client-supplied userId. Also backs the dashboard (recommended lesson,
   * total learning time, current/target level).
   */
  @Get()
  myProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getUserProgressSummary(user.id);
  }
}

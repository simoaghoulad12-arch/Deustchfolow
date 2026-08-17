import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CorrectionService } from '../services/correction.service';
import { WritingCorrectDto } from '../dto/writing-correct.dto';
import { AiThrottlerGuard } from '../guards/ai-throttler.guard';

@UseGuards(AiThrottlerGuard)
@Controller('ai/writing')
export class WritingController {
  constructor(private readonly correctionService: CorrectionService) {}

  @Post('correct')
  correct(@CurrentUser() user: AuthenticatedUser, @Body() dto: WritingCorrectDto) {
    return this.correctionService.correctWriting(user.id, dto);
  }
}

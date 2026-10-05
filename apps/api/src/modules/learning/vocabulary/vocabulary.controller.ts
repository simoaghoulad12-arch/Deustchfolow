import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { QueryVocabularyDto, ReviewVocabularyDto } from '../dto/vocabulary.dto';
import { VocabularyService } from './vocabulary.service';

@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  list(@Query() query: QueryVocabularyDto) {
    return this.vocabularyService.list(query);
  }

  /** The caller's own training queue — no userId parameter exists. */
  @Get('due')
  due(@CurrentUser() user: AuthenticatedUser) {
    return this.vocabularyService.getDueCards(user.id);
  }

  /** Correctness is decided server-side from the typed answer only. */
  @Post(':vocabularyId/review')
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param('vocabularyId', ParseUUIDPipe) vocabularyId: string,
    @Body() dto: ReviewVocabularyDto,
  ) {
    return this.vocabularyService.review(user.id, vocabularyId, dto.answer);
  }
}

@Controller('me/vocabulary')
export class MyVocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.vocabularyService.getSummary(user.id);
  }
}

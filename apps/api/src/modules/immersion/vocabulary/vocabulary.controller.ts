import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { VocabularyService } from './vocabulary.service';

const BrowseSchema = z
  .object({
    level: z.enum(['A1', 'A2', 'B1', 'B2']).optional(),
    category: z.string().max(60).optional(),
    q: z.string().trim().max(80).optional(),
    page: z.coerce.number().int().min(1).max(1000).optional(),
  })
  .strict();
const ReviewSchema = z.object({ grade: z.number().int().min(0).max(5) }).strict();
const IntroduceSchema = z.object({ count: z.number().int().min(1).max(20).optional(), category: z.string().max(60).optional() }).strict();

@Controller('live/vocabulary')
export class VocabularyController {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Get()
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.vocabulary.overview(user.id);
  }

  @Get('due')
  due(@CurrentUser() user: AuthenticatedUser) {
    return this.vocabulary.due(user.id);
  }

  @Get('browse')
  browse(@CurrentUser() user: AuthenticatedUser, @Query(new ZodValidationPipe(BrowseSchema)) query: z.infer<typeof BrowseSchema>) {
    return this.vocabulary.browse(user.id, query);
  }

  @Post('introduce')
  introduce(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(IntroduceSchema)) body: z.infer<typeof IntroduceSchema>) {
    return this.vocabulary.introduce(user.id, body.count, body.category);
  }

  @Post(':id/add')
  add(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.vocabulary.add(user.id, id);
  }

  @Post(':id/review')
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReviewSchema)) body: z.infer<typeof ReviewSchema>,
  ) {
    return this.vocabulary.review(user.id, id, body.grade);
  }
}

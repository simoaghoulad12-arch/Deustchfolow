import { Controller, Get, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PathService } from './path.service';

const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160);

@Controller('live/path')
export class PathController {
  constructor(private readonly path: PathService) {}

  @Get()
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.path.overview(user.id);
  }

  @Get('lessons/:slug')
  lesson(@CurrentUser() user: AuthenticatedUser, @Param('slug', new ZodValidationPipe(Slug)) slug: string) {
    return this.path.lesson(user.id, slug);
  }

  @Post('lessons/:slug/complete')
  complete(@CurrentUser() user: AuthenticatedUser, @Param('slug', new ZodValidationPipe(Slug)) slug: string) {
    return this.path.complete(user.id, slug);
  }
}

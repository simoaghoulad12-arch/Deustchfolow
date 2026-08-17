import { Controller, Get, Param, Query } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { QueryCoursesDto } from '../dto/query-courses.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query() query: QueryCoursesDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':course')
  findOne(@Param('course') slug: string, @CurrentUser() user: AuthenticatedUser) {
    return this.coursesService.findBySlug(slug, user.id);
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { CareerService } from './career.service';
import { QueryCareerModulesDto } from './dto/query-career-modules.dto';

@Controller('career/modules')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Get()
  listActive(@Query() query: QueryCareerModulesDto) {
    return this.careerService.listActive(query);
  }

  @Get(':moduleId')
  findOne(@Param('moduleId') moduleId: string) {
    return this.careerService.findOne(moduleId);
  }
}

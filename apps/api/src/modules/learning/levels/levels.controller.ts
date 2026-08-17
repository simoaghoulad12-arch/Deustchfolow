import { Controller, Get, Param } from '@nestjs/common';
import { LevelsService } from './levels.service';

@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  findAll() {
    return this.levelsService.findAll();
  }

  @Get(':level')
  findOne(@Param('level') level: string) {
    return this.levelsService.findByCode(level);
  }
}

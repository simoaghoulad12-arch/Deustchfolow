import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@deutschflow/types';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GermanySourceService } from './germany-source.service';
import { CreateOfficialSourceDto } from '../dto/create-official-source.dto';
import { UpdateOfficialSourceDto } from '../dto/update-official-source.dto';
import { QueryOfficialSourcesDto } from '../dto/query-official-sources.dto';

@Controller('germany/sources')
export class GermanySourceController {
  constructor(private readonly sourceService: GermanySourceService) {}

  @Get()
  listActive(@Query() query: QueryOfficialSourcesDto) {
    return this.sourceService.listActive(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateOfficialSourceDto) {
    return this.sourceService.adminCreate(dto);
  }

  @Patch(':sourceId')
  @Roles(UserRole.ADMIN)
  update(@Param('sourceId') sourceId: string, @Body() dto: UpdateOfficialSourceDto) {
    return this.sourceService.adminUpdate(sourceId, dto);
  }
}

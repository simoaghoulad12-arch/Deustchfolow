import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { QuerySimulationsDto } from './dto/query-simulations.dto';

@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Get()
  listActive(@Query() query: QuerySimulationsDto) {
    return this.simulationsService.listActive(query);
  }

  @Get(':simulationId')
  findOne(@Param('simulationId', ParseUUIDPipe) simulationId: string) {
    return this.simulationsService.findOne(simulationId);
  }
}

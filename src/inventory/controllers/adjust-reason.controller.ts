import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { AdjustReasonService } from '../application/adjust-reason.service';
import { CreateAdjustReasonDto } from '../dto/create-adjust-reason.dto';
import { UpdateAdjustReasonDto } from '../dto/update-adjust-reason.dto';

@Controller('inventory/adjust-reasons')
export class AdjustReasonController {
  constructor(private readonly service: AdjustReasonService) {}

  @Get('/active')
  async findActive() {
    return this.service.findActive();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAdjustReasonDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdjustReasonDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.service.activate(id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.service.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
  }
}

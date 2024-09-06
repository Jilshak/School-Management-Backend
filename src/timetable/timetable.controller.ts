import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('timetable')
@ApiBearerAuth()
@Controller('timetable')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new timetable' })
  @ApiResponse({ status: 201, description: 'The timetable has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateTimetableDto })
  create(@Body() createTimetableDto: CreateTimetableDto) {
    return this.timetableService.create(createTimetableDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all timetables' })
  @ApiResponse({ status: 200, description: 'Return all timetables.' })
  findAll() {
    return this.timetableService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a timetable by id' })
  @ApiResponse({ status: 200, description: 'Return the timetable.' })
  @ApiResponse({ status: 404, description: 'Timetable not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Timetable ID' })
  findOne(@Param('id') id: string) {
    return this.timetableService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a timetable' })
  @ApiResponse({ status: 200, description: 'The timetable has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Timetable not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Timetable ID' })
  @ApiBody({ type: UpdateTimetableDto })
  update(@Param('id') id: string, @Body() updateTimetableDto: UpdateTimetableDto) {
    return this.timetableService.update(id, updateTimetableDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a timetable' })
  @ApiResponse({ status: 200, description: 'The timetable has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Timetable not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Timetable ID' })
  remove(@Param('id') id: string) {
    return this.timetableService.remove(id);
  }
}
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, ValidationPipe, Query } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';
import { UserRole } from 'src/domains/enums/user-roles.enum';

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
  @ApiBody({ type: CreateTimetableDto,description:"Upsert Functionality" })
  create(@Body(ValidationPipe) createTimetableDto: CreateTimetableDto,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.timetableService.create(createTimetableDto,schoolId);
  }


  
  @Get('/teacher-available')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get available staff for a given time slot' })
  @ApiResponse({ status: 200, description: 'Return the available staff.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiQuery({ name: 'startTime', required: true, type: Number })
  @ApiQuery({ name: 'endTime', required: true, type: Number })
  @ApiQuery({ name: 'subjectId', required: true, type: String })
  @ApiQuery({ name: 'classId', required: true, type: String })
  findStaffAvailable(
    @Query('startTime') startTime: number,
    @Query('endTime') endTime: number,
    @Query('subjectId') subjectId: string,
    @Query('classId') classId: string,
    @LoginUser('schoolId') schoolId: Types.ObjectId
  ) {
    return this.timetableService.findAvailableTeacher(startTime, endTime, subjectId, schoolId,classId);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all timetables' })
  @ApiResponse({ status: 200, description: 'Return all timetables.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'full', required: false, type: Boolean })
  findAll(
    @LoginUser("schoolId") schoolId: Types.ObjectId,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('full') full?: boolean
  ) {
    return this.timetableService.findAll(schoolId, page, limit, full);
  }

  @Get(':classId')
  @Roles('admin', 'teacher', UserRole.STUDENT)
  @ApiOperation({ summary: 'Get a timetable by id' })
  @ApiResponse({ status: 200, description: 'Return the timetable.' })
  @ApiResponse({ status: 404, description: 'Timetable not found.' })
  @ApiParam({ name: 'classId', required: true, description: 'Classroom ID' })
  findOne(@Param('classId') id: string,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.timetableService.findOne(id,schoolId);
  }



 
}
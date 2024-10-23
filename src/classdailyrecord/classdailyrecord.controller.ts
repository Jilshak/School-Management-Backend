import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateClassDailyRecordDto } from './dto/create-classdailyrecord.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LoginUser } from '../shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';
import { ClassDailyRecordService } from './classdailyrecord.service';

@ApiTags('classdailyrecord')
@ApiBearerAuth()
@Controller('classdailyrecord')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClassDailyRecordController {
  constructor(private readonly classDailyRecordService: ClassDailyRecordService) {}

  @Post()
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Create or update a class daily record' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created or updated.' })
  async upsert(
    @Body() createClassDailyRecordDto: CreateClassDailyRecordDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.classDailyRecordService.upsert(createClassDailyRecordDto, schoolId);
  }

  @Get('/:date')
  @Roles('teacher', 'student', 'admin')
  @ApiOperation({ summary: 'Get a class daily record by classroom ID (or user\'s class) and date' })
  @ApiResponse({ status: 200, description: 'The class daily record has been successfully retrieved.' })
  @ApiParam({ name: 'date', required: true, description: 'The date for the daily record' })
  async getByClassroomAndDate(
    @Param('date') date: string,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('classId') userClassId: Types.ObjectId,
  ) {
    const classroomId = userClassId?.toString() || null;
    return this.classDailyRecordService.getByClassroomAndDate(classroomId, date, schoolId);
  }
}

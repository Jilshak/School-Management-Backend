import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateLessonPlanDto } from './dto/create-lessonplan.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LoginUser } from '../shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';
import { LessonPlanService } from './lessonplan.service';

@ApiTags('lessonplan')
@ApiBearerAuth()
@Controller('lessonplan')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LessonPlanController {
  constructor(private readonly lessonPlanService: LessonPlanService) {}

  @Post()
  @Roles('teacher')
  @ApiOperation({ summary: 'Create or update a lesson plan entry' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created or updated.' })
  async upsert(
    @Body() createLessonPlanDto: CreateLessonPlanDto,
    @LoginUser('userId') teacherId: Types.ObjectId,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.lessonPlanService.upsert(createLessonPlanDto, teacherId, schoolId);
  }

  @Get('weekly')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Get Weekly lesson plan entries' })
  @ApiResponse({ status: 200, description: 'Returns the Weekly lesson plan entries.' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date in YYYY-MM-DD format. If not provided, defaults to current date.' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date in YYYY-MM-DD format. If not provided, defaults to current date.' })
  async getWeeklyLessonPlans(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @LoginUser('userId') userId: Types.ObjectId,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('roles') roles: string[],
  ) {
    return this.lessonPlanService.getWeeklyLessonPlans(startDate, endDate, userId, schoolId, roles);
  }
}

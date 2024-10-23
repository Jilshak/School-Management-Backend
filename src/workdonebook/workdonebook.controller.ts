import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WorkDoneBookService } from './workdonebook.service';
import { CreateWorkDoneBookDto } from './dto/create-workdonebook.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LoginUser } from '../shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';

@ApiTags('workdonebook')
@ApiBearerAuth()
@Controller('workdonebook')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class WorkDoneBookController {
  constructor(private readonly workDoneBookService: WorkDoneBookService) {}

  @Post()
  @Roles('teacher')
  @ApiOperation({ summary: 'Create or update a work done book entry' })
  @ApiResponse({ status: 201, description: 'The record has been successfully created or updated.' })
  async upsert(
    @Body() createWorkDoneBookDto: CreateWorkDoneBookDto,
    @LoginUser('userId') teacherId: Types.ObjectId,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.workDoneBookService.upsert([createWorkDoneBookDto], teacherId, schoolId);
  }

  @Get('daily')
  @Roles('teacher', 'admin')
  @ApiOperation({ summary: 'Get daily work done book entries' })
  @ApiResponse({ status: 200, description: 'Returns the daily work done book entries.' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date in YYYY-MM-DD format. If not provided, defaults to current date.' })
  async getDailyWorkDoneBooks(
    @Query('date') date: string,
    @LoginUser('userId') userId: Types.ObjectId,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('roles') roles: string[],
  ) {
    return this.workDoneBookService.getDailyWorkDoneBooks(date, userId, schoolId, roles);
  }
}

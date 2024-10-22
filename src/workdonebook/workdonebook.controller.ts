import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
}

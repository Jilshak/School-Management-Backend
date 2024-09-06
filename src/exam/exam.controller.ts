import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateOnlineExamDto } from './dto/create-online-exam.dto';
import { CreateOfflineExamDto } from './dto/create-offline-exam.dto';
import { CreateExamTimeTableDto } from './dto/create-exam-time-table.dto';
import { CreateResultDto } from './dto/create-result.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('exam')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @Roles('admin', 'teacher')
  create(@Body() createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  findAll() {
    return this.examService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  findOne(@Param('id') id: string) {
    return this.examService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examService.update(id, updateExamDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.examService.remove(id);
  }

  // Online Exam
  @Post('online')
  @Roles('admin', 'teacher')
  createOnlineExam(@Body() createOnlineExamDto: CreateOnlineExamDto) {
    return this.examService.createOnlineExam(createOnlineExamDto);
  }

  // Offline Exam
  @Post('offline')
  @Roles('admin', 'teacher')
  createOfflineExam(@Body() createOfflineExamDto: CreateOfflineExamDto) {
    return this.examService.createOfflineExam(createOfflineExamDto);
  }

  // Exam Time Table
  @Post('time-table')
  @Roles('admin', 'teacher')
  createExamTimeTable(@Body() createExamTimeTableDto: CreateExamTimeTableDto) {
    return this.examService.createExamTimeTable(createExamTimeTableDto);
  }

  // Result
  @Post('result')
  @Roles('admin', 'teacher')
  createResult(@Body() createResultDto: CreateResultDto) {
    return this.examService.createResult(createResultDto);
  }
}
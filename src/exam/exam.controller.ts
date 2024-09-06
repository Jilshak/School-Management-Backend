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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('exams')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiResponse({ status: 201, description: 'The exam has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateExamDto })
  create(@Body() createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto);
  }

  @Post('online')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new online exam' })
  @ApiResponse({ status: 201, description: 'The online exam has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateOnlineExamDto })
  createOnlineExam(@Body() createOnlineExamDto: CreateOnlineExamDto) {
    return this.examService.createOnlineExam(createOnlineExamDto);
  }

  @Post('offline')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new offline exam' })
  @ApiResponse({ status: 201, description: 'The offline exam has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateOfflineExamDto })
  createOfflineExam(@Body() createOfflineExamDto: CreateOfflineExamDto) {
    return this.examService.createOfflineExam(createOfflineExamDto);
  }

  @Post('timetable')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new exam timetable' })
  @ApiResponse({ status: 201, description: 'The exam timetable has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateExamTimeTableDto })
  createExamTimeTable(@Body() createExamTimeTableDto: CreateExamTimeTableDto) {
    return this.examService.createExamTimeTable(createExamTimeTableDto);
  }

  @Post('result')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new exam result' })
  @ApiResponse({ status: 201, description: 'The exam result has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateResultDto })
  createResult(@Body() createResultDto: CreateResultDto) {
    return this.examService.createResult(createResultDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all exams' })
  @ApiResponse({ status: 200, description: 'Return all exams.' })
  findAll() {
    return this.examService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get an exam by id' })
  @ApiResponse({ status: 200, description: 'Return the exam.' })
  @ApiResponse({ status: 404, description: 'Exam not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Exam ID' })
  findOne(@Param('id') id: string) {
    return this.examService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update an exam' })
  @ApiResponse({ status: 200, description: 'The exam has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Exam not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Exam ID' })
  @ApiBody({ type: UpdateExamDto })
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examService.update(id, updateExamDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an exam' })
  @ApiResponse({ status: 200, description: 'The exam has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Exam not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Exam ID' })
  remove(@Param('id') id: string) {
    return this.examService.remove(id);
  }
}
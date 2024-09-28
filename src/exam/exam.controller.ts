import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, ValidationPipe, Query } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateClassTest, CreateSemExamDto } from './dto/create-exam.dto';
import { UpdateSemExamDto, UpdateClassTestDto } from './dto/update-exam.dto';
import { CreateOnlineExamDto } from './dto/create-online-exam.dto';
import { CreateOfflineExamDto } from './dto/create-offline-exam.dto';
import { CreateExamTimeTableDto } from './dto/create-exam-time-table.dto';
import { CreateResultDto } from './dto/create-result.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('exams')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  // Existing methods
  @Post("/sem-exam")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiResponse({ status: 201, description: 'The exam has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateSemExamDto })
  createSemExam(@Body(ValidationPipe) createExamDto: CreateSemExamDto,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.examService.createSemExam(createExamDto,schoolId);
  }

  @Post("/class-test")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiResponse({ status: 201, description: 'The exam has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateClassTest })
  createClassTest(@Body(ValidationPipe) createExamDto: CreateClassTest,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.examService.createClassTest(createExamDto,schoolId);
  }

  @Get("offline-exam/student")
  @Roles('student')
  @ApiOperation({ summary: 'Get all offline exams' })
  @ApiResponse({ status: 200, description: 'Returns all offline exams.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllOfflineExamForStudent(
    @LoginUser("classId") classId: Types.ObjectId,
    @LoginUser("schoolId") schoolId: Types.ObjectId
  ) {
    return this.examService.findAllOfflineExamsForStudent(classId, schoolId);
  }

  @Get("offline-exam")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get all offline exams' })
  @ApiResponse({ status: 200, description: 'Returns all offline exams.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllOfflineExam(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @LoginUser("schoolId") schoolId: Types.ObjectId
  ) {
    return this.examService.findAllOfflineExams(Number(page), Number(limit), search, schoolId);
  }

  // New CRUD operations for SemExam
  @Get("/sem-exam/:id")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get a semester exam by id' })
  @ApiParam({ name: 'id', type: 'string' })
  getSemExam(@Param('id') id: string, @LoginUser("schoolId") schoolId: Types.ObjectId) {
    return this.examService.getSemExam(id, schoolId);
  }

  @Put("/sem-exam/:id")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a semester exam' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateSemExamDto })
  updateSemExam(@Param('id') id: string, @Body() updateExamDto: UpdateSemExamDto, @LoginUser("schoolId") schoolId: Types.ObjectId) {
    return this.examService.updateSemExam(id, updateExamDto, schoolId);
  }

  @Delete("/sem-exam/:id")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Delete a semester exam' })
  @ApiParam({ name: 'id', type: 'string' })
  deleteSemExam(@Param('id') id: string, @LoginUser("schoolId") schoolId: Types.ObjectId) {
    return this.examService.deleteSemExam(id, schoolId);
  }

  // New CRUD operations for ClassTest
  @Get("/class-test/:id")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get a class test by id' })
  @ApiParam({ name: 'id', type: 'string' })
  getClassTest(@Param('id') id: string, @LoginUser("schoolId") schoolId: Types.ObjectId) {
    return this.examService.getClassTest(id, schoolId);
  }

  @Put("/class-test/:id")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a class test' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateClassTestDto })
  updateClassTest(@Param('id') id: string, @Body() updateExamDto: UpdateClassTestDto, @LoginUser("schoolId") schoolId: Types.ObjectId) {
    return this.examService.updateClassTest(id, updateExamDto, schoolId);
  }

  @Delete("/class-test/:id")
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Delete a class test' })
  @ApiParam({ name: 'id', type: 'string' })
  deleteClassTest(@Param('id') id: string, @LoginUser("schoolId") schoolId: Types.ObjectId) {
    return this.examService.deleteClassTest(id, schoolId);
  }
}
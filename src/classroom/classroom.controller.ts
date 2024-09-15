import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, ValidationPipe, Query } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateTimeTableDto } from './dto/create-time-table.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { CreateStudyMaterialDto } from './dto/create-study-material.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';

@ApiTags('classroom')
@ApiBearerAuth()
@Controller('classroom')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @Roles('admin','staff')
  @ApiOperation({ summary: 'Create a new classroom' })
  @ApiResponse({ status: 201, description: 'The classroom has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateClassroomDto })
  async create(@Body(ValidationPipe) createClassroomDto: CreateClassroomDto,@LoginUser("schoolId") schoolId) {
    return this.classroomService.create(createClassroomDto,schoolId);
  }

  @Get()
  @Roles('admin', 'teacher','staff')
  @ApiOperation({ summary: 'Get all classrooms' })
  @ApiResponse({ status: 200, description: 'Return all classrooms.' })
  @ApiQuery({ name: 'search', required: false, description: 'search by class Name and academic year' })
  @ApiQuery({ name: 'full', required: false, description: 'If pagination not required give this true' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  async findAll(
    @LoginUser("schoolId") schoolId: Types.ObjectId,
    @Query('search') search?: string,
    @Query('full') full?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.classroomService.findAll(schoolId, search, full, page, limit);
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student','staff')
  @ApiOperation({ summary: 'Get a classroom by id' })
  @ApiResponse({ status: 200, description: 'Return the classroom.' })
  @ApiResponse({ status: 404, description: 'Classroom not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Classroom ID' })
  async findOne(@Param('id') id: string,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.classroomService.findOne(id,schoolId);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a classroom' })
  @ApiResponse({ status: 200, description: 'The classroom has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Classroom not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Classroom ID' })
  async update(@Param('id') id: string, @Body(ValidationPipe) updateClassroomDto: CreateClassroomDto,@LoginUser('schoolId') schoolId:Types.ObjectId) {
    return this.classroomService.update(id, updateClassroomDto,schoolId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a classroom' })
  @ApiResponse({ status: 200, description: 'The classroom has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Classroom not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Classroom ID' })
  async remove(@Param('id') id: string,@LoginUser("schoolId") schoolId:Types.ObjectId,@Body("makeStudentsAlsoInactive") makeStudentsAlsoInactive:boolean) {
    return this.classroomService.remove(id,schoolId,makeStudentsAlsoInactive);
  }


  @Get('time-table')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get the time table' })
  @ApiResponse({ status: 200, description: 'Return the time table.' })
  @ApiQuery({ name: 'classroomId', required: false, description: 'Classroom ID to filter time table' })
  @ApiQuery({ name: 'date', required: false, description: 'Date to filter time table' })
  async getTimeTable(@Query('classroomId') classroomId?: string, @Query('date') date?: string) {
    return this.classroomService.getTimeTable(classroomId, date);
  }

  @Get('teacher-time-table/:teacherId')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get a teacher\'s time table' })
  @ApiResponse({ status: 200, description: 'Return the teacher\'s time table.' })
  @ApiResponse({ status: 404, description: 'Teacher not found.' })
  @ApiParam({ name: 'teacherId', required: true, description: 'Teacher ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for the time table' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for the time table' })
  async getTeacherTimeTable(
    @Param('teacherId') teacherId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.classroomService.getTeacherTimeTable(teacherId, startDate, endDate);
  }

  @Post('time-table')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new time table' })
  @ApiResponse({ status: 201, description: 'The time table has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateTimeTableDto })
  async createTimeTable(@Body(ValidationPipe) createTimeTableDto: CreateTimeTableDto) {
    return this.classroomService.createTimeTable(createTimeTableDto);
  }

  @Post('attendance')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create attendance record' })
  @ApiResponse({ status: 201, description: 'The attendance record has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateAttendanceDto })
  async createAttendance(@Body(ValidationPipe) createAttendanceDto: CreateAttendanceDto) {
    return this.classroomService.createAttendance(createAttendanceDto);
  }

  @Get('attendance-report/:classroomId')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get attendance report for a classroom' })
  @ApiResponse({ status: 200, description: 'Return the attendance report.' })
  @ApiResponse({ status: 404, description: 'Classroom not found.' })
  @ApiParam({ name: 'classroomId', required: true, description: 'Classroom ID' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date for the report' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date for the report' })
  async getAttendanceReport(
    @Param('classroomId') classroomId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.classroomService.getAttendanceReport(classroomId, startDate, endDate);
  }

  @Post('take-attendance')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Take attendance for multiple students' })
  @ApiResponse({ status: 201, description: 'Attendance has been successfully recorded.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: [CreateAttendanceDto] })
  async takeAttendance(@Body(ValidationPipe) takeAttendanceDto: CreateAttendanceDto[]) {
    return this.classroomService.takeAttendance(takeAttendanceDto);
  }

  @Get('students-performance/:classroomId')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get students performance for a classroom' })
  @ApiResponse({ status: 200, description: 'Return the students performance.' })
  @ApiResponse({ status: 404, description: 'Classroom not found.' })
  @ApiParam({ name: 'classroomId', required: true, description: 'Classroom ID' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Subject ID to filter performance' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for performance data' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for performance data' })
  async getStudentsPerformance(
    @Param('classroomId') classroomId: string,
    @Query('subjectId') subjectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.classroomService.getStudentsPerformance(classroomId, subjectId, startDate, endDate);
  }

  @Get('syllabus/:subjectId')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get syllabus for a subject' })
  @ApiResponse({ status: 200, description: 'Return the syllabus.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @ApiParam({ name: 'subjectId', required: true, description: 'Subject ID' })
  async getSyllabus(@Param('subjectId') subjectId: string) {
    return this.classroomService.getSyllabus(subjectId);
  }

  @Post('syllabus')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create or update syllabus' })
  @ApiResponse({ status: 201, description: 'The syllabus has been successfully created or updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateSyllabusDto })
  async manageSyllabus(@Body(ValidationPipe) createSyllabusDto: CreateSyllabusDto) {
    return this.classroomService.manageSyllabus(createSyllabusDto);
  }

  @Post('study-material')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create study material' })
  @ApiResponse({ status: 201, description: 'The study material has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateStudyMaterialDto })
  async createStudyMaterial(@Body(ValidationPipe) createStudyMaterialDto: CreateStudyMaterialDto) {
    return this.classroomService.createStudyMaterial(createStudyMaterialDto);
  }

  @Get('study-material')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all study materials' })
  @ApiResponse({ status: 200, description: 'Return all study materials.' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Subject ID to filter study materials' })
  @ApiQuery({ name: 'type', required: false, description: 'Type of study material' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  async getStudyMaterials(
    @Query('subjectId') subjectId?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.classroomService.getStudyMaterials(subjectId, type, page, limit);
  }
}
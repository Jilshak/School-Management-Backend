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

@Controller('classroom')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @Roles('admin', 'teacher')
  async create(@Body(ValidationPipe) createClassroomDto: CreateClassroomDto) {
    return this.classroomService.create(createClassroomDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  async findAll() {
    return this.classroomService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  async findOne(@Param('id') id: string) {
    return this.classroomService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateClassroomDto: UpdateClassroomDto) {
    return this.classroomService.update(id, updateClassroomDto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.classroomService.remove(id);
  }

  @Post('subject')
  @Roles('admin', 'teacher')
  async createSubject(@Body(ValidationPipe) createSubjectDto: CreateSubjectDto) {
    return this.classroomService.createSubject(createSubjectDto);
  }

  @Get('time-table')
  @Roles('admin', 'teacher', 'student')
  async getTimeTable() {
    return this.classroomService.getTimeTable();
  }

  @Get('teacher-time-table/:teacherId')
  @Roles('admin', 'teacher')
  async getTeacherTimeTable(@Param('teacherId') teacherId: string) {
    return this.classroomService.getTeacherTimeTable(teacherId);
  }

  @Post('time-table')
  @Roles('admin', 'teacher')
  async createTimeTable(@Body(ValidationPipe) createTimeTableDto: CreateTimeTableDto) {
    return this.classroomService.createTimeTable(createTimeTableDto);
  }

  @Post('attendance')
  @Roles('admin', 'teacher')
  async createAttendance(@Body(ValidationPipe) createAttendanceDto: CreateAttendanceDto) {
    return this.classroomService.createAttendance(createAttendanceDto);
  }

  @Get('attendance-report/:classroomId')
  @Roles('admin', 'teacher')
  async getAttendanceReport(
    @Param('classroomId') classroomId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.classroomService.getAttendanceReport(classroomId, new Date(startDate), new Date(endDate));
  }

  @Post('take-attendance')
  @Roles('admin', 'teacher')
  async takeAttendance(@Body(ValidationPipe) takeAttendanceDto: CreateAttendanceDto[]) {
    return this.classroomService.takeAttendance(takeAttendanceDto);
  }

  @Get('students-performance/:classroomId')
  @Roles('admin', 'teacher')
  async getStudentsPerformance(@Param('classroomId') classroomId: string) {
    return this.classroomService.getStudentsPerformance(classroomId);
  }

  @Get('syllabus/:subjectId')
  @Roles('admin', 'teacher', 'student')
  async getSyllabus(@Param('subjectId') subjectId: string) {
    return this.classroomService.getSyllabus(subjectId);
  }

  @Post('syllabus')
  @Roles('admin', 'teacher')
  async manageSyllabus(@Body(ValidationPipe) createSyllabusDto: CreateSyllabusDto) {
    return this.classroomService.manageSyllabus(createSyllabusDto);
  }

  @Post('study-material')
  @Roles('admin', 'teacher')
  async createStudyMaterial(@Body(ValidationPipe) createStudyMaterialDto: CreateStudyMaterialDto) {
    return this.classroomService.createStudyMaterial(createStudyMaterialDto);
  }

  @Get('study-material')
  @Roles('admin', 'teacher', 'student')
  async getStudyMaterials() {
    return this.classroomService.getStudyMaterials();
  }
}
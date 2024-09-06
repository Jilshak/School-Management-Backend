import { Controller, UseGuards, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Student } from '../domains/schema/students.schema';
import { Admission } from '../domains/schema/admission.schema';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'The student has been successfully created.', type: Student })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateStudentDto })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Return all students.', type: [Student] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by id' })
  @ApiResponse({ status: 200, description: 'Return the student.', type: Student })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Student ID' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({ status: 200, description: 'The student has been successfully updated.', type: Student })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Student ID' })
  @ApiBody({ type: UpdateStudentDto })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a student' })
  @ApiResponse({ status: 200, description: 'The student has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Student ID' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  // Admission
  @Post('admission')
  @ApiOperation({ summary: 'Create a new admission' })
  @ApiResponse({ status: 201, description: 'The admission has been successfully created.', type: Admission })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateAdmissionDto })
  createAdmission(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.studentsService.createAdmission(createAdmissionDto);
  }

  @Get('admission')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get all admissions' })
  @ApiResponse({ status: 200, description: 'Return all admissions.', type: [Admission] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllAdmissions() {
    return this.studentsService.findAllAdmissions();
  }

  @Get('admission/:id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get an admission by id' })
  @ApiResponse({ status: 200, description: 'Return the admission.', type: Admission })
  @ApiResponse({ status: 404, description: 'Admission not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  findOneAdmission(@Param('id') id: string) {
    return this.studentsService.findOneAdmission(id);
  }

  @Put('admission/:id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update an admission' })
  @ApiResponse({ status: 200, description: 'The admission has been successfully updated.', type: Admission })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Admission not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  @ApiBody({ type: CreateAdmissionDto })
  updateAdmission(@Param('id') id: string, @Body() updateAdmissionDto: CreateAdmissionDto) {
    return this.studentsService.updateAdmission(id, updateAdmissionDto);
  }

  @Delete('admission/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an admission' })
  @ApiResponse({ status: 200, description: 'The admission has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Admission not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  removeAdmission(@Param('id') id: string) {
    return this.studentsService.removeAdmission(id);
  }
}
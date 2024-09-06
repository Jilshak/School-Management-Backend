import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../domains/schema/user.schema';
import { Student } from '../domains/schema/students.schema';
import { Staff } from '../domains/schema/staff.schema';
import { Admission } from '../domains/schema/admission.schema';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.', type: [User] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Students
  @Post('students')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'The student has been successfully created.', type: Student })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateStudentDto })
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.userService.createStudent(createStudentDto);
  }

  @Get('students')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Return all students.', type: [Student] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllStudents() {
    return this.userService.findAllStudents();
  }

  @Get('students/:id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get a student by id' })
  @ApiResponse({ status: 200, description: 'Return the student.', type: Student })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Student ID' })
  findOneStudent(@Param('id') id: string) {
    return this.userService.findOneStudent(id);
  }

  @Put('students/:id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({ status: 200, description: 'The student has been successfully updated.', type: Student })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Student ID' })
  @ApiBody({ type: CreateStudentDto })
  updateStudent(@Param('id') id: string, @Body() updateStudentDto: CreateStudentDto) {
    return this.userService.updateStudent(id, updateStudentDto);
  }

  @Delete('students/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a student' })
  @ApiResponse({ status: 200, description: 'The student has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Student ID' })
  removeStudent(@Param('id') id: string) {
    return this.userService.removeStudent(id);
  }

  // Staff
  @Post('staff')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({ status: 201, description: 'The staff member has been successfully created.', type: Staff })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateStaffDto })
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.userService.createStaff(createStaffDto);
  }

  @Get('staff')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all staff members' })
  @ApiResponse({ status: 200, description: 'Return all staff members.', type: [Staff] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllStaff() {
    return this.userService.findAllStaff();
  }

  @Get('staff/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a staff member by id' })
  @ApiResponse({ status: 200, description: 'Return the staff member.', type: Staff })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Staff ID' })
  findOneStaff(@Param('id') id: string) {
    return this.userService.findOneStaff(id);
  }

  @Put('staff/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a staff member' })
  @ApiResponse({ status: 200, description: 'The staff member has been successfully updated.', type: Staff })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Staff ID' })
  @ApiBody({ type: CreateStaffDto })
  updateStaff(@Param('id') id: string, @Body() updateStaffDto: CreateStaffDto) {
    return this.userService.updateStaff(id, updateStaffDto);
  }

  @Delete('staff/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a staff member' })
  @ApiResponse({ status: 200, description: 'The staff member has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Staff member not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Staff ID' })
  removeStaff(@Param('id') id: string) {
    return this.userService.removeStaff(id);
  }

  // Admission
  @Post('admission')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new admission' })
  @ApiResponse({ status: 201, description: 'The admission has been successfully created.', type: Admission })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateAdmissionDto })
  createAdmission(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.userService.createAdmission(createAdmissionDto);
  }

  @Get('admission')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all admissions' })
  @ApiResponse({ status: 200, description: 'Return all admissions.', type: [Admission] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllAdmissions() {
    return this.userService.findAllAdmissions();
  }

  @Get('admission/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get an admission by id' })
  @ApiResponse({ status: 200, description: 'Return the admission.', type: Admission })
  @ApiResponse({ status: 404, description: 'Admission not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  findOneAdmission(@Param('id') id: string) {
    return this.userService.findOneAdmission(id);
  }

  @Put('admission/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update an admission' })
  @ApiResponse({ status: 200, description: 'The admission has been successfully updated.', type: Admission })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Admission not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  @ApiBody({ type: CreateAdmissionDto })
  updateAdmission(@Param('id') id: string, @Body() updateAdmissionDto: CreateAdmissionDto) {
    return this.userService.updateAdmission(id, updateAdmissionDto);
  }

  @Delete('admission/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an admission' })
  @ApiResponse({ status: 200, description: 'The admission has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Admission not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  removeAdmission(@Param('id') id: string) {
    return this.userService.removeAdmission(id);
  }
}
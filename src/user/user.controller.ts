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

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Students
  @Post('students')
  @Roles('admin', 'teacher')
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.userService.createStudent(createStudentDto);
  }

  @Get('students')
  @Roles('admin', 'teacher')
  findAllStudents() {
    return this.userService.findAllStudents();
  }

  @Get('students/:id')
  @Roles('admin', 'teacher')
  findOneStudent(@Param('id') id: string) {
    return this.userService.findOneStudent(id);
  }

  @Put('students/:id')
  @Roles('admin', 'teacher')
  updateStudent(@Param('id') id: string, @Body() updateStudentDto: CreateStudentDto) {
    return this.userService.updateStudent(id, updateStudentDto);
  }

  @Delete('students/:id')
  @Roles('admin')
  removeStudent(@Param('id') id: string) {
    return this.userService.removeStudent(id);
  }

  // Staff
  @Post('staff')
  @Roles('admin')
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.userService.createStaff(createStaffDto);
  }

  @Get('staff')
  @Roles('admin')
  findAllStaff() {
    return this.userService.findAllStaff();
  }

  @Get('staff/:id')
  @Roles('admin')
  findOneStaff(@Param('id') id: string) {
    return this.userService.findOneStaff(id);
  }

  @Put('staff/:id')
  @Roles('admin')
  updateStaff(@Param('id') id: string, @Body() updateStaffDto: CreateStaffDto) {
    return this.userService.updateStaff(id, updateStaffDto);
  }

  @Delete('staff/:id')
  @Roles('admin')
  removeStaff(@Param('id') id: string) {
    return this.userService.removeStaff(id);
  }

  // Admission
  @Post('admission')
  @Roles('admin')
  createAdmission(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.userService.createAdmission(createAdmissionDto);
  }

  @Get('admission')
  @Roles('admin')
  findAllAdmissions() {
    return this.userService.findAllAdmissions();
  }

  @Get('admission/:id')
  @Roles('admin')
  findOneAdmission(@Param('id') id: string) {
    return this.userService.findOneAdmission(id);
  }

  @Put('admission/:id')
  @Roles('admin')
  updateAdmission(@Param('id') id: string, @Body() updateAdmissionDto: CreateAdmissionDto) {
    return this.userService.updateAdmission(id, updateAdmissionDto);
  }

  @Delete('admission/:id')
  @Roles('admin')
  removeAdmission(@Param('id') id: string) {
    return this.userService.removeAdmission(id);
  }
}
import { Controller, UseGuards, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('students')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('admin', 'teacher')
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles('admin', 'teacher')
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  // Admission
  @Post('admission')
  createAdmission(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.studentsService.createAdmission(createAdmissionDto);
  }

  @Get('admission')
  findAllAdmissions() {
    return this.studentsService.findAllAdmissions();
  }

  @Get('admission/:id')
  findOneAdmission(@Param('id') id: string) {
    return this.studentsService.findOneAdmission(id);
  }

  @Put('admission/:id')
  updateAdmission(@Param('id') id: string, @Body() updateAdmissionDto: CreateAdmissionDto) {
    return this.studentsService.updateAdmission(id, updateAdmissionDto);
  }

  @Delete('admission/:id')
  removeAdmission(@Param('id') id: string) {
    return this.studentsService.removeAdmission(id);
  }
}
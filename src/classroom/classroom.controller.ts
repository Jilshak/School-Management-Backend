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
import { UserRole } from 'src/domains/enums/user-roles.enum';

@ApiTags('classroom')
@ApiBearerAuth()
@Controller('classroom')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @Roles(UserRole.ADMIN,UserRole.ADMISSION_TEAM)
  @ApiOperation({ summary: 'Create a new classroom' })
  @ApiResponse({ status: 201, description: 'The classroom has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateClassroomDto })
  async create(@Body(ValidationPipe) createClassroomDto: CreateClassroomDto,@LoginUser("schoolId") schoolId) {
    return this.classroomService.create(createClassroomDto,schoolId);
  }

  @Get()
  @Roles('admin', 'teacher',UserRole.ADMISSION_TEAM,UserRole.HR)
  @ApiOperation({ summary: 'Get all classrooms' })
  @ApiResponse({ status: 200, description: 'Return all classrooms.' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'to get active and inactive classes' })
  @ApiQuery({ name: 'search', required: false, description: 'search by class Name and academic year' })
  @ApiQuery({ name: 'full', required: false, description: 'If pagination not required give this true' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  async findAll(
    @LoginUser("schoolId") schoolId: Types.ObjectId,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('full') full?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const isActiveBoolean = isActive ? isActive.toLowerCase() === 'true' : undefined;
    return this.classroomService.findAll(schoolId, isActiveBoolean, search, full, page, limit);
  }

  @Get("/with-students")
  @Roles('admin', 'teacher',UserRole.ADMISSION_TEAM,UserRole.HR)
  @ApiOperation({ summary: 'Get all classrooms' })
  @ApiResponse({ status: 200, description: 'Return all classrooms.' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'to get active and inactive classes' })
  @ApiQuery({ name: 'search', required: false, description: 'search by class Name and academic year' })
  @ApiQuery({ name: 'full', required: false, description: 'If pagination not required give this true' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  async findAllWithStudents(
    @LoginUser("schoolId") schoolId: Types.ObjectId,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('full') full?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const isActiveBoolean = isActive ? isActive.toLowerCase() === 'true' : undefined;
    return this.classroomService.findAllWithStudents(schoolId, isActiveBoolean, search, full, page, limit);
  }

  @Get("/get-teachers-not-classTeacher")
  @Roles(UserRole.ADMIN,UserRole.ADMISSION_TEAM)
  @ApiOperation({ summary: "The Teachers that don't have classes" })
  @ApiResponse({ status: 200, description: "The Teachers that don't have classes" })
  @ApiResponse({ status: 404, description: 'Something went wrong' })
  async getTeacherNotClassTeacher(@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.classroomService.getTeacherNotClassTeacher(schoolId);
  }

  @Get(':id')
  @Roles()
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


}
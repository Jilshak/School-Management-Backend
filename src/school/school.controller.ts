import { Controller, UseGuards, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { School } from '../domains/schema/school.schema';
import { Class } from '../domains/schema/class.schema';
import { Section } from '../domains/schema/section.schema';

@ApiTags('school')
@ApiBearerAuth()
@Controller('school')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new school' })
  @ApiResponse({ status: 201, description: 'The school has been successfully created.', type: School })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateSchoolDto })
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all schools' })
  @ApiResponse({ status: 200, description: 'Return all schools.', type: [School] })
  findAll() {
    return this.schoolService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a school by id' })
  @ApiResponse({ status: 200, description: 'Return the school.', type: School })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'id', required: true, description: 'School ID' })
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a school' })
  @ApiResponse({ status: 200, description: 'The school has been successfully updated.', type: School })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'id', required: true, description: 'School ID' })
  @ApiBody({ type: UpdateSchoolDto })
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school' })
  @ApiResponse({ status: 200, description: 'The school has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'id', required: true, description: 'School ID' })
  remove(@Param('id') id: string) {
    return this.schoolService.remove(id);
  }

  // Class
  @Post(':schoolId/class')
  @ApiOperation({ summary: 'Create a new class in a school' })
  @ApiResponse({ status: 201, description: 'The class has been successfully created.', type: Class })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiBody({ type: CreateClassDto })
  createClass(@Param('schoolId') schoolId: string, @Body() createClassDto: CreateClassDto) {
    return this.schoolService.createClass(schoolId, createClassDto);
  }

  @Get(':schoolId/class')
  @ApiOperation({ summary: 'Get all classes in a school' })
  @ApiResponse({ status: 200, description: 'Return all classes.', type: [Class] })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  findAllClasses(@Param('schoolId') schoolId: string) {
    return this.schoolService.findAllClasses(schoolId);
  }

  @Get(':schoolId/class/:id')
  @ApiOperation({ summary: 'Get a class by id in a school' })
  @ApiResponse({ status: 200, description: 'Return the class.', type: Class })
  @ApiResponse({ status: 404, description: 'School or Class not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiParam({ name: 'id', required: true, description: 'Class ID' })
  findOneClass(@Param('schoolId') schoolId: string, @Param('id') id: string) {
    return this.schoolService.findOneClass(schoolId, id);
  }

  @Put(':schoolId/class/:id')
  @ApiOperation({ summary: 'Update a class in a school' })
  @ApiResponse({ status: 200, description: 'The class has been successfully updated.', type: Class })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'School or Class not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiParam({ name: 'id', required: true, description: 'Class ID' })
  @ApiBody({ type: UpdateClassDto })
  updateClass(@Param('schoolId') schoolId: string, @Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.schoolService.updateClass(schoolId, id, updateClassDto);
  }

  @Delete(':schoolId/class/:id')
  @ApiOperation({ summary: 'Delete a class from a school' })
  @ApiResponse({ status: 200, description: 'The class has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'School or Class not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiParam({ name: 'id', required: true, description: 'Class ID' })
  removeClass(@Param('schoolId') schoolId: string, @Param('id') id: string) {
    return this.schoolService.removeClass(schoolId, id);
  }

  // Section
  @Post(':schoolId/class/:classId/section')
  @ApiOperation({ summary: 'Create a new section in a class' })
  @ApiResponse({ status: 201, description: 'The section has been successfully created.', type: Section })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'School or Class not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiParam({ name: 'classId', required: true, description: 'Class ID' })
  @ApiBody({ type: CreateSectionDto })
  createSection(@Param('schoolId') schoolId: string, @Param('classId') classId: string, @Body() createSectionDto: CreateSectionDto) {
    return this.schoolService.createSection(schoolId, classId, createSectionDto);
  }

  @Get(':schoolId/class/:classId/section')
  @ApiOperation({ summary: 'Get all sections in a class' })
  @ApiResponse({ status: 200, description: 'Return all sections.', type: [Section] })
  @ApiResponse({ status: 404, description: 'School or Class not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiParam({ name: 'classId', required: true, description: 'Class ID' })
  findAllSections(@Param('schoolId') schoolId: string, @Param('classId') classId: string) {
    return this.schoolService.findAllSections(schoolId, classId);
  }

  @Get(':schoolId/class/:classId/section/:id')
  @ApiOperation({ summary: 'Get a section by id in a class' })
  @ApiResponse({ status: 200, description: 'Return the section.', type: Section })
  @ApiResponse({ status: 404, description: 'School, Class or Section not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiParam({ name: 'classId', required: true, description: 'Class ID' })
  @ApiParam({ name: 'id', required: true, description: 'Section ID' })
  findOneSection(@Param('schoolId') schoolId: string, @Param('classId') classId: string, @Param('id') id: string) {
    return this.schoolService.findOneSection(schoolId, classId, id);
  }

  @Put(':schoolId/class/:classId/section/:id')
  @ApiOperation({ summary: 'Update a section in a class' })
  @ApiResponse({ status: 200, description: 'The section has been successfully updated.', type: Section })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'School, Class or Section not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiParam({ name: 'classId', required: true, description: 'Class ID' })
  @ApiParam({ name: 'id', required: true, description: 'Section ID' })
  @ApiBody({ type: UpdateSectionDto })
  updateSection(@Param('schoolId') schoolId: string, @Param('classId') classId: string, @Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.schoolService.updateSection(schoolId, classId, id, updateSectionDto);
  }

  @Delete(':schoolId/class/:classId/section/:id')
  @ApiOperation({ summary: 'Delete a section from a class' })
  @ApiResponse({ status: 200, description: 'The section has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'School, Class or Section not found.' })
  @ApiParam({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiParam({ name: 'classId', required: true, description: 'Class ID' })
  @ApiParam({ name: 'id', required: true, description: 'Section ID' })
  removeSection(@Param('schoolId') schoolId: string, @Param('classId') classId: string, @Param('id') id: string) {
    return this.schoolService.removeSection(schoolId, classId, id);
  }
}
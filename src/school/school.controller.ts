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

@Controller('school')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @Roles('admin')
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolService.create(createSchoolDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  findAll() {
    return this.schoolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolService.remove(id);
  }

  // Class
  @Post(':schoolId/class')
  createClass(@Param('schoolId') schoolId: string, @Body() createClassDto: CreateClassDto) {
    return this.schoolService.createClass(schoolId, createClassDto);
  }

  @Get(':schoolId/class')
  findAllClasses(@Param('schoolId') schoolId: string) {
    return this.schoolService.findAllClasses(schoolId);
  }

  @Get(':schoolId/class/:id')
  findOneClass(@Param('schoolId') schoolId: string, @Param('id') id: string) {
    return this.schoolService.findOneClass(schoolId, id);
  }

  @Put(':schoolId/class/:id')
  updateClass(@Param('schoolId') schoolId: string, @Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.schoolService.updateClass(schoolId, id, updateClassDto);
  }

  @Delete(':schoolId/class/:id')
  removeClass(@Param('schoolId') schoolId: string, @Param('id') id: string) {
    return this.schoolService.removeClass(schoolId, id);
  }

  // Section
  @Post(':schoolId/class/:classId/section')
  createSection(@Param('schoolId') schoolId: string, @Param('classId') classId: string, @Body() createSectionDto: CreateSectionDto) {
    return this.schoolService.createSection(schoolId, classId, createSectionDto);
  }

  @Get(':schoolId/class/:classId/section')
  findAllSections(@Param('schoolId') schoolId: string, @Param('classId') classId: string) {
    return this.schoolService.findAllSections(schoolId, classId);
  }

  @Get(':schoolId/class/:classId/section/:id')
  findOneSection(@Param('schoolId') schoolId: string, @Param('classId') classId: string, @Param('id') id: string) {
    return this.schoolService.findOneSection(schoolId, classId, id);
  }

  @Put(':schoolId/class/:classId/section/:id')
  updateSection(@Param('schoolId') schoolId: string, @Param('classId') classId: string, @Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.schoolService.updateSection(schoolId, classId, id, updateSectionDto);
  }

  @Delete(':schoolId/class/:classId/section/:id')
  removeSection(@Param('schoolId') schoolId: string, @Param('classId') classId: string, @Param('id') id: string) {
    return this.schoolService.removeSection(schoolId, classId, id);
  }
}
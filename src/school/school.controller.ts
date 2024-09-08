import { Controller, UseGuards, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { School } from '../domains/schema/school.schema';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('school')
@ApiBearerAuth()
@Controller('school')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @Roles('superadmin')
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
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a school by id' })
  @ApiResponse({ status: 200, description: 'Return the school.', type: School })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'id', required: true, description: 'School ID' })
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a school' })
  @ApiResponse({ status: 200, description: 'The school has been successfully updated.', type: School })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'id', required: true, description: 'School ID' })
  @ApiBody({ type: UpdateSchoolDto })
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.update(id, updateSchoolDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Partially update a school' })
  @ApiResponse({ status: 200, description: 'The school has been successfully updated.', type: School })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'id', required: true, description: 'School ID' })
  @ApiBody({ type: UpdateSchoolDto })
  patch(@Param('id') id: string, @Body() patchSchoolDto: Partial<UpdateSchoolDto>) {
    return this.schoolService.patch(id, patchSchoolDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a school' })
  @ApiResponse({ status: 200, description: 'The school has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'School not found.' })
  @ApiParam({ name: 'id', required: true, description: 'School ID' })
  remove(@Param('id') id: string) {
    return this.schoolService.remove(id);
  }
}
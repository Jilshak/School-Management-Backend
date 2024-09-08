import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';

@ApiTags('subjects')
@ApiBearerAuth()
@Controller('subjects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'The subject has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateSubjectDto })
  create(@Body() createSubjectDto: CreateSubjectDto,@LoginUser("schoolId") schoolId:string) {
    return this.subjectsService.create(createSubjectDto,schoolId);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiResponse({ status: 200, description: 'Return all subjects.' })
  async findAll(@LoginUser("schoolId") schoolId:string) {
    return await this.subjectsService.findAll(schoolId);
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a subject by id' })
  @ApiResponse({ status: 200, description: 'Return the subject.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Subject ID' })
  findOne(@Param('id') id: string,@LoginUser("schoolId") schoolId:string) {
    return this.subjectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiResponse({ status: 200, description: 'The subject has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Subject ID' })
  @ApiBody({ type: UpdateSubjectDto })
  update(@Param('id') id: string, @Body() updateSubjectDto: CreateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiResponse({ status: 200, description: 'The subject has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Subject ID' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
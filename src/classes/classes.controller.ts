import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'The class has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateClassDto })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all classes' })
  @ApiResponse({ status: 200, description: 'Return all classes.' })
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a class by id' })
  @ApiResponse({ status: 200, description: 'Return the class.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Class ID' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({ status: 200, description: 'The class has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Class ID' })
  @ApiBody({ type: UpdateClassDto })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({ status: 200, description: 'The class has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Class ID' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
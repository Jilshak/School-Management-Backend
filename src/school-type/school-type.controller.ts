import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SchoolTypeService } from './school-type.service';
import { CreateSchoolTypeDto } from './dto/create-school-type.dto';
import { UpdateSchoolTypeDto } from './dto/update-school-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('school-type')
@ApiBearerAuth()
@Controller('school-type')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class SchoolTypeController {
  constructor(private readonly schoolTypeService: SchoolTypeService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new school type' })
  @ApiResponse({ status: 201, description: 'The school type has been successfully created.' })
  create(@Body() createSchoolTypeDto: CreateSchoolTypeDto) {
    console.log(createSchoolTypeDto)
    return this.schoolTypeService.create(createSchoolTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all school types' })
  @ApiResponse({ status: 200, description: 'Return all school types.' })
  findAll() {
    return this.schoolTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a school type by id' })
  @ApiResponse({ status: 200, description: 'Return the school type.' })
  findOne(@Param('id') id: string) {
    return this.schoolTypeService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a school type' })
  @ApiResponse({ status: 200, description: 'The school type has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateSchoolTypeDto: UpdateSchoolTypeDto) {
    return this.schoolTypeService.update(id, updateSchoolTypeDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a school type' })
  @ApiResponse({ status: 200, description: 'The school type has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.schoolTypeService.remove(id);
  }
}
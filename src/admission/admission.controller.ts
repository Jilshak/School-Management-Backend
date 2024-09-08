import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('admissions')
@ApiBearerAuth()
@Controller('admissions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new admission' })
  @ApiResponse({ status: 201, description: 'The admission has been successfully created.' })
  @ApiBody({ type: CreateAdmissionDto })
  create(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.admissionService.create(createAdmissionDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all admissions' })
  @ApiResponse({ status: 200, description: 'Return all admissions.' })
  findAll() {
    return this.admissionService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a admission by id' })
  @ApiResponse({ status: 200, description: 'Return the admission.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  findOne(@Param('id') id: string) {
    return this.admissionService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a admission' })
  @ApiResponse({ status: 200, description: 'The admission has been successfully updated.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  @ApiBody({ type: UpdateAdmissionDto })
  update(@Param('id') id: string, @Body() updateAdmissionDto: UpdateAdmissionDto) {
    return this.admissionService.update(id, updateAdmissionDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a admission' })
  @ApiResponse({ status: 200, description: 'The admission has been successfully deleted.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  remove(@Param('id') id: string) {
    return this.admissionService.remove(id);
  }

  @Put(':id/fee')
  @Roles('admin')
  @ApiOperation({ summary: 'Update admission fee' })
  @ApiResponse({ status: 200, description: 'The admission fee has been successfully updated.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  @ApiBody({ schema: { properties: { admissionFee: { type: 'number' } } } })
  updateAdmissionFee(@Param('id') id: string, @Body('admissionFee') admissionFee: number) {
    return this.admissionService.updateAdmissionFee(id, admissionFee);
  }

  @Put(':id/link-student')
  @Roles('admin')
  @ApiOperation({ summary: 'Link student to admission' })
  @ApiResponse({ status: 200, description: 'The student has been successfully linked to the admission.' })
  @ApiParam({ name: 'id', required: true, description: 'Admission ID' })
  @ApiBody({ schema: { properties: { studentId: { type: 'string' } } } })
  linkStudentId(@Param('id') id: string, @Body('studentId') studentId: string) {
    return this.admissionService.linkStudentId(id, studentId);
  }
}
import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';
import { SyllabusService } from './syllabus.service';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';

@ApiTags('syllabus')
@ApiBearerAuth()
@Controller('syllabus')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SyllabusController {
    constructor(private readonly syllabusService: SyllabusService) {}

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Create a new syllabus' })
    @ApiResponse({ status: 201, description: 'Syllabus created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiBody({ type: CreateSyllabusDto })
    async createSyllabus(@Body() createSyllabusDto: CreateSyllabusDto, @LoginUser("schoolId") schoolId: Types.ObjectId) {
        return this.syllabusService.create(createSyllabusDto, schoolId);
    }

    @Get()
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Get all syllabuses' })
    @ApiResponse({ status: 200, description: 'Return all syllabuses' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getAllSyllabuses(
        @LoginUser("schoolId") schoolId: Types.ObjectId,
    ) {
        return this.syllabusService.findAll(schoolId);
    }

    @Get("students")
    @Roles('student')
    @ApiOperation({ summary: 'Get all syllabuses for a student' })
    @ApiResponse({ status: 200, description: 'Return all syllabuses for a student' })
    @ApiResponse({ status: 404, description: 'No syllabuses found for the student' })
    async getSyllabusesForStudent(@LoginUser("classId") classId: Types.ObjectId, @LoginUser("schoolId") schoolId: Types.ObjectId) {
        return this.syllabusService.findOneForStudent(classId, schoolId);
    }

    @Get(':id')
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Get a syllabus by id' })
    @ApiResponse({ status: 200, description: 'Return the syllabus' })
    @ApiResponse({ status: 404, description: 'Syllabus not found' })
    @ApiParam({ name: 'id', type: 'string' })
    async getSyllabus(@Param('id') id: string, @LoginUser("schoolId") schoolId: Types.ObjectId) {
        return this.syllabusService.findOne(id, schoolId);
    }

    @Patch(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Update a syllabus' })
    @ApiResponse({ status: 200, description: 'Syllabus updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Syllabus not found' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiBody({ type: UpdateSyllabusDto })
    async updateSyllabus(
        @Param('id') id: string,
        @Body() updateSyllabusDto: UpdateSyllabusDto,
        @LoginUser("schoolId") schoolId: Types.ObjectId
    ) {
        return this.syllabusService.update(id, updateSyllabusDto, schoolId);
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete a syllabus' })
    @ApiResponse({ status: 200, description: 'Syllabus deleted successfully' })
    @ApiResponse({ status: 404, description: 'Syllabus not found' })
    @ApiParam({ name: 'id', type: 'string' })
    async deleteSyllabus(@Param('id') id: string, @LoginUser("schoolId") schoolId: Types.ObjectId) {
        return this.syllabusService.remove(id, schoolId);
    }
}

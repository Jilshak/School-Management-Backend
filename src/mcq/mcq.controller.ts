import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { McqService } from './mcq.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateMCQDto } from './dto/create-mcq.dto';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';
import { UpdateMCQDto } from './dto/update-mcq.dto';

@ApiTags('MCQ')
@ApiBearerAuth()
@Controller('mcq')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class McqController {
    constructor(private readonly mcqService: McqService) {}

    @Post()
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Create a new MCQ' })
    @ApiResponse({ status: 201, description: 'MCQ created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiBody({ type: CreateMCQDto })
    create(@Body() createMcqDto: CreateMCQDto,@LoginUser("schoolId") schoolId:Types.ObjectId,@LoginUser("userId") userId:Types.ObjectId) {
        return this.mcqService.create(createMcqDto,schoolId,userId);
    }
    
    @Get()
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Get all MCQs' })
    @ApiResponse({ status: 200, description: 'MCQs fetched successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    findAll(@LoginUser("schoolId") schoolId:Types.ObjectId) {
        return this.mcqService.findAll(schoolId);
    }
    
    @Get('syllabus/:id')
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Get syllabus by id' })
    @ApiResponse({ status: 200, description: 'Syllabus fetched successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    findSyllabusById(@Param('id') id: string,@LoginUser("schoolId") schoolId:Types.ObjectId) {
        return this.mcqService.findSyllabusById(id,schoolId);
    }

    @Patch(':id')
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Update MCQ by id' })
    @ApiResponse({ status: 200, description: 'MCQ updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    update(@Param('id') id: string, @Body() updateMcqDto: UpdateMCQDto,@LoginUser("schoolId") schoolId:Types.ObjectId,@LoginUser("userId") userId:Types.ObjectId) {
        return this.mcqService.update(id, updateMcqDto,schoolId,userId);
    }

    @Delete(':id')
    @Roles('admin', 'teacher')
    @ApiOperation({ summary: 'Delete MCQ by id' })
    @ApiResponse({ status: 200, description: 'MCQ deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    delete(@Param('id') id: string,@LoginUser("schoolId") schoolId:Types.ObjectId) {
        return this.mcqService.delete(id,schoolId);
    }
    
}

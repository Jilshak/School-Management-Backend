import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  Patch,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateClassroomOfStudentsDto, UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from '../domains/schema/user.schema';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';
import { UserRole } from 'src/domains/enums/user-roles.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin', 'superadmin', UserRole.HR)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateUserDto })
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @LoginUser('schoolId') schoolId: any,
  ) {
    try {
      const res = await this.userService.create(createUserDto, schoolId);
      return { status: 201, description: res };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.', type: [User] })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    isArray: true,
    description: 'Filter users by role.',
    type: [String],
    example: [UserRole.ADMIN, UserRole.TEACHER],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page.',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for filtering users.',
    example: 'john',
  })
  @ApiQuery({
    name: 'full',
    required: false,
    type: Boolean,
    description: 'Whether to return full user details.',
    example: false,
  })
  async findAll(
    @Query('role') role: UserRole[],
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
    @Query('full') full: boolean = false,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    try {
      return await this.userService.findAll(
        role,
        schoolId,
        full,
        page,
        limit,
        search,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // fetch students
  @Get('/students')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({
    status: 200,
    description: 'Return all students.',
    type: [User],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page.',
    example: 10,
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    type: String,
    description: 'Filter by gender (male/female).',
    example: 'male',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    type: String,
    description: 'Filter by class ID.',
    example: '60a5e6f9b9e7c123456789ab',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort by field (firstName/enrollmentNumber).',
    example: 'firstName',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order (asc/desc).',
    example: 'asc',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for filtering students by name or username.',
    example: 'john',
  })
  async findAllStudents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('gender') gender?: string,
    @Query('classId') classId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @LoginUser('schoolId') schoolId?: Types.ObjectId,
  ) {
    try {
      return await this.userService.findAllStudents(
        schoolId,
        page,
        limit,
        gender,
        classId,
        sortBy,
        sortOrder,
        search,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/count-by-role')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.', type: [User] })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    isArray: true,
    description: 'Filter users by role.',
    type: [String],
    example: ['admin', 'teacher'],
  })
  findCount(
    @Query('role') role: UserRole[],
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.userService.findCount(role, schoolId);
  }

  @Get('/getmydetails')
  @Roles()
  @ApiOperation({ summary: 'Get my details' })
  @ApiResponse({ status: 200, description: 'Return the user.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findMyDetails(
    @LoginUser('userId') userId: string,
    @LoginUser('schoolId') schoolId,
  ) {
    return this.userService.findOne(userId, schoolId);
  }

  @Get(':id')
  @Roles()
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  findOne(@Param('id') id: string, @LoginUser('schoolId') schoolId) {
    return this.userService.findOne(id, schoolId);
  }

  @Patch('update-classroom')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  @ApiBody({ type: UpdateClassroomOfStudentsDto })
  updateClassroom(
    @Body() updateUserDto: UpdateClassroomOfStudentsDto,
    @LoginUser('schoolId') schoolId,
  ) {
    return this.userService.updateClassroomOfStudents(updateUserDto, schoolId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @LoginUser('schoolId') schoolId,
  ) {
    return this.userService.update(id, updateUserDto, schoolId);
  }

  @Patch('reset-password/:id')
  @Roles(UserRole.ADMIN,UserRole.HR, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Param('id') id: string, @Body() resetPasswordDto: ResetPasswordDto, @LoginUser("schoolId") schoolId) {
    return this.userService.resetPassword(id, resetPasswordDto, schoolId);
  }

  @Delete(':id')
  @Roles('admin', UserRole.HR)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  async remove(@Param('id') id: string, @LoginUser('schoolId') schoolId) {
    try {
      return await this.userService.remove(id, schoolId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}

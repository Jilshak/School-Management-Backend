import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Types } from 'mongoose';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/domains/enums/user-roles.enum';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { LeaveReqDto } from './dto/create-leave-request.dto';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(UserRole.ADMIN,UserRole.TEACHER)
  @ApiOperation({ summary: 'Create attendance' })
  @ApiResponse({ status: 201, description: 'The attendance has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    type: CreateAttendanceDto,
    description: 'Attendance data',
    examples: {
      example1: {
        value: {
          attendanceDate: new Date(),
          classId: '60d5ecb54acf3e001f3f9f1e',
          teacherId: '60d5ecb54acf3e001f3f9f1f',
          studentsAttendance: [
            {
              studentId: '60d5ecb54acf3e001f3f9f20',
              status: 'present'
            },
            {
              studentId: '60d5ecb54acf3e001f3f9f21',
              status: 'absent'
            },
            {
              studentId: '60d5ecb54acf3e001f3f9f23',
              status: 'halfday'
            }
          ]
        }
      }
    }
  })
  create(@Body() createAttendanceDto: CreateAttendanceDto,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.attendanceService.create(createAttendanceDto,schoolId);
  }

  @Get('/student-attendance')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get attendance records for a student' })
  @ApiQuery({ name: 'month', type: 'number', required: false, description: 'Month number (0-11, where 0 is January). If not provided, current month is used.' })
  @ApiResponse({ status: 200, description: 'Returns attendance records for the specified student.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  findOneStudent(
    @LoginUser("userId") studentId: Types.ObjectId,
    @LoginUser("schoolId") schoolId: Types.ObjectId,
    @Query('month') month?: number
  ) {
    return this.attendanceService.findOne(studentId, schoolId, month);
  }

  @Get(":classId")
  @ApiOperation({ summary: 'Get all attendance records for a class' })
  @ApiParam({ name: 'classId', type: 'string', description: 'ID of the class' })
  @ApiQuery({ name: 'month', type: 'date', description: 'ID of the class' })
  @ApiResponse({ status: 200, description: 'Returns all attendance records for the specified class.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  findAll(@Param("classId") classId: string,@Query("month") month:Date) {
    return this.attendanceService.findAll(classId,month);
  }

  @Get("/get-attendance-single-day/:classId")
  @Roles(UserRole.ADMIN,UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all attendance records for a class' })
  @ApiParam({ name: 'classId', type: 'string', description: 'ID of the class' })
  @ApiQuery({ name: 'date', type: 'date', description: 'attendance date' })
  @ApiResponse({ status: 200, description: 'Returns all attendance records for the specified class.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  findOfaDate(@Param("classId") classId: string,@Query("date") date:Date,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.attendanceService.findOfaDate(classId,schoolId,date);
  }



  @Get('/by-student/:studentId')
  @Roles(UserRole.ADMIN,UserRole.TEACHER)
  @ApiOperation({ summary: 'Get attendance records for a student' })
  @ApiParam({ name: 'studentId', type: 'string', description: 'ID of the student' })
  @ApiQuery({ name: 'month', type: 'number', required: false, description: 'Month number (0-11, where 0 is January). If not provided, current month is used.' })
  @ApiResponse({ status: 200, description: 'Returns attendance records for the specified student.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  findOne(
    @Param('studentId') studentId: string,
    @LoginUser("schoolId") schoolId: Types.ObjectId,
    @Query('month') month?: number
  ) {
    return this.attendanceService.findOne(studentId, schoolId, month);
  }

  @Patch('/update-by-date-and-class/:classId')
  @ApiOperation({ summary: 'Update attendance records for a class on a specific date' })
  @ApiParam({ name: 'classId', type: 'string', description: 'ID of the class' })
  @ApiBody({ type: UpdateAttendanceDto })
  @ApiResponse({ status: 200, description: 'Attendance records updated successfully.' })
  @ApiResponse({ status: 404, description: 'Class not found or attendance record not found.' })
  updateByClass(
    @Param('classId') classId: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @LoginUser("schoolId") schoolId: Types.ObjectId
  ) {
    return this.attendanceService.updateByClass(classId, updateAttendanceDto, schoolId);
  }

  @Patch('/update-by-date-and-student/:studentId')
  @ApiOperation({ summary: 'Update attendance records for a student on specific dates' })
  @ApiParam({ name: 'studentId', type: 'string', description: 'ID of the student' })
  @ApiBody({ 
    description: 'Array of attendance updates',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'date' },
          status: { type: 'string', enum: ['present', 'absent', 'halfday'] }
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Attendance records updated successfully.' })
  @ApiResponse({ status: 404, description: 'Student not found or attendance records not updated.' })
  updateByStudent(
    @Param('studentId') studentId: string,
    @Body() attendanceUpdates: { date: Date; status: string }[],
    @LoginUser("schoolId") schoolId: Types.ObjectId
  ) {
    return this.attendanceService.updateByStudent(studentId, schoolId, attendanceUpdates);
  }

  @Post("/leave-request")
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({ status: 201, description: 'The leave request has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    type: LeaveReqDto,
    description: 'Leave request data',
  })
  createLeaveRequest(@Body() leaveReqDto: LeaveReqDto, @LoginUser("userId") studentId: Types.ObjectId,@LoginUser("classId") classId:Types.ObjectId) {
    return this.attendanceService.createLeaveRequest(leaveReqDto, studentId,classId);
  }

  @Get("/leave-request/student")
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({ status: 201, description: 'The leave request has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    type: LeaveReqDto,
    description: 'Leave request data',
  })
  getLeaveRequestStudent( @LoginUser("userId") studentId: Types.ObjectId,@LoginUser("classId") classId:Types.ObjectId) {
    return this.attendanceService.getLeaveRequestStudent( studentId,classId);
  }
}

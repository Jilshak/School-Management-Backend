import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Types } from 'mongoose';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/domains/enums/user-roles.enum';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { LeaveReqDto } from './dto/create-leave-request.dto';
import { CreateRegularizationDto } from './dto/regularization.dto';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create attendance' })
  @ApiResponse({
    status: 201,
    description: 'The attendance has been successfully created.',
  })
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
              status: 'present',
              remark: 'fever',
            },
            {
              studentId: '60d5ecb54acf3e001f3f9f21',
              status: 'absent',
              remark: 'fever',
            },
            {
              studentId: '60d5ecb54acf3e001f3f9f23',
              status: 'halfday',
              remark: 'fever',
            },
          ],
        },
      },
    },
  })
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.attendanceService.create(createAttendanceDto, schoolId);
  }

  @Get('/student-attendance')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get attendance records for a student' })
  @ApiQuery({
    name: 'month',
    type: 'number',
    required: false,
    description:
      'Month number (0-11, where 0 is January). If not provided, current month is used.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns attendance records for the specified student.',
  })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  findOneStudent(
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.attendanceService.findOne(studentId, schoolId, month, year);
  }

  @Get(':classId')
  @ApiOperation({ summary: 'Get all attendance records for a class' })
  @ApiParam({ name: 'classId', type: 'string', description: 'ID of the class' })
  @ApiQuery({
    name: 'month',
    type: 'date',
    description: 'ID of the class',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all attendance records for the specified class.',
  })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  findAll(@Param('classId') classId: string, @Query('month') month: Date) {
    return this.attendanceService.findAll(classId, month);
  }

  @Get('/get-attendance-single-day/:classId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all attendance records for a class' })
  @ApiParam({ name: 'classId', type: 'string', description: 'ID of the class' })
  @ApiQuery({ name: 'date', type: 'date', description: 'attendance date' })
  @ApiResponse({
    status: 200,
    description: 'Returns all attendance records for the specified class.',
  })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  findOfaDate(
    @Param('classId') classId: string,
    @Query('date') date: Date,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.attendanceService.findOfaDate(classId, schoolId, date);
  }

  @Get('/by-student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get attendance records for a student' })
  @ApiParam({
    name: 'studentId',
    type: 'string',
    description: 'ID of the student',
  })
  @ApiQuery({
    name: 'month',
    type: 'number',
    required: false,
    description:
      'Month number (0-11, where 0 is January). If not provided, current month is used.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns attendance records for the specified student.',
  })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  findOne(
    @Param('studentId') studentId: string,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @Query('month') month?: number,
  ) {
    return this.attendanceService.findOne(studentId, schoolId, month);
  }

  @Patch('/update-by-date-and-class/:classId')
  @ApiOperation({
    summary: 'Update attendance records for a class on a specific date',
  })
  @ApiParam({ name: 'classId', type: 'string', description: 'ID of the class' })
  @ApiBody({ type: UpdateAttendanceDto })
  @ApiResponse({
    status: 200,
    description: 'Attendance records updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Class not found or attendance record not found.',
  })
  updateByClass(
    @Param('classId') classId: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.attendanceService.updateByClass(
      classId,
      updateAttendanceDto,
      schoolId,
    );
  }

  @Patch('/update-by-date-and-student/:studentId')
  @ApiOperation({
    summary: 'Update attendance records for a student on specific dates',
  })
  @ApiParam({
    name: 'studentId',
    type: 'string',
    description: 'ID of the student',
  })
  @ApiBody({
    description: 'Array of attendance updates',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'date' },
          status: { type: 'string', enum: ['present', 'absent', 'halfday'] },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance records updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found or attendance records not updated.',
  })
  updateByStudent(
    @Param('studentId') studentId: string,
    @Body() attendanceUpdates: { date: Date; status: string }[],
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.attendanceService.updateByStudent(
      studentId,
      schoolId,
      attendanceUpdates,
    );
  }

  @Post('/leave-request')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({
    status: 201,
    description: 'The leave request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    type: LeaveReqDto,
    description: 'Leave request data',
  })
  createLeaveRequest(
    @Body() leaveReqDto: LeaveReqDto,
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('classId') classId: Types.ObjectId,
  ) {
    return this.attendanceService.createLeaveRequest(
      leaveReqDto,
      studentId,
      classId,
    );
  }

  @Patch('/leave-request/edit/:leaveId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({
    status: 201,
    description: 'The leave request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    type: LeaveReqDto,
    description: 'Leave request data',
  })
  updateLeaveRequest(
    @Param('leaveId') leaveId: string,
    @Body() leaveReqDto: LeaveReqDto,
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('classId') classId: Types.ObjectId,
  ) {
    return this.attendanceService.updateLeaveRequest(
      leaveId,
      leaveReqDto,
      studentId,
      classId,
    );
  }

  @Get('/leave-request/student')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({
    status: 201,
    description: 'The leave request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  getLeaveRequestStudent(
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('classId') classId: Types.ObjectId,
  ) {
    return this.attendanceService.getLeaveRequestStudent(studentId, classId);
  }

  @Get('/leave-request/class-teacher')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all leave requests for the class' })
  @ApiResponse({
    status: 201,
    description: 'These are all the leave requests for the class.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  getLeaveRequestClassTeacher(@LoginUser('userId') teacherId: Types.ObjectId) {
    return this.attendanceService.getLeaveRequestClassTEacher(teacherId);
  }

  @Patch('/leave-request/:leaveId')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Create leave request' })
  @ApiParam({ name: 'leaveId', type: 'string', description: 'leave id' })
  @ApiBody({
    schema: {
      properties: {
        status: { type: 'string', enum: ['approved', 'rejected'] },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The leave request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  updateLeaveRequestStatusChange(
    @Param('leaveId') leaveId: string,
    @Body() body: { status: 'approved' | 'rejected' },
    @LoginUser('userId') teacherId: Types.ObjectId,
  ) {
    return this.attendanceService.updateLeaveStatus(
      leaveId,
      body.status,
      teacherId,
    );
  }

  @Delete('/leave-request/:id')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Delete a leave request' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the leave request',
  })
  @ApiResponse({
    status: 200,
    description: 'The leave request has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Leave request not found.' })
  async deleteLeaveRequest(
    @Param('id') id: string,
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('classId') classId: Types.ObjectId,
  ) {
    return this.attendanceService.deleteLeaveRequest(id, studentId, classId);
  }

  @Post('/regularization')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Create attendance regularization request' })
  @ApiResponse({
    status: 201,
    description: 'The regularization request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateRegularizationDto })
  createRegularizationRequest(
    @Body() createRegularizationDto: CreateRegularizationDto,
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('classId') classId: Types.ObjectId,
  ) {
    return this.attendanceService.createRegularizationRequest(
      createRegularizationDto,
      studentId,
      classId,
    );
  }

  @Patch('/regularization/:id')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Update attendance regularization request' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the regularization request',
  })
  @ApiResponse({
    status: 200,
    description: 'The regularization request has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 404,
    description: 'Regularization request not found.',
  })
  @ApiBody({ type: CreateRegularizationDto })
  updateRegularizationRequest(
    @Param('id') id: string,
    @Body() updateRegularizationDto: CreateRegularizationDto,
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('classId') classId: Types.ObjectId,
  ) {
    return this.attendanceService.updateRegularizationRequest(
      id,
      updateRegularizationDto,
      studentId,
      classId,
    );
  }

  @Delete('/regularization/:id')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Delete attendance regularization request' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the regularization request',
  })
  @ApiResponse({
    status: 200,
    description: 'The regularization request has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 404,
    description: 'Regularization request not found.',
  })
  deleteRegularizationRequest(
    @Param('id') id: string,
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('classId') classId: Types.ObjectId,
  ) {
    return this.attendanceService.deleteRegularizationRequest(
      id,
      studentId,
      classId,
    );
  }

  @Get('/regularization/student')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get regularization requests for a student' })
  @ApiResponse({
    status: 200,
    description:
      'Returns all regularization requests for the specified student.',
  })
  @ApiResponse({
    status: 404,
    description: 'No regularization requests found.',
  })
  getRegularizationRequests(
    @LoginUser('userId') studentId: Types.ObjectId,
    @LoginUser('classId') classId: Types.ObjectId,
  ) {
    return this.attendanceService.getRegularizationRequests(studentId, classId);
  }

  @Get('/regularization/teacher')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get regularization requests for a student' })
  @ApiResponse({
    status: 200,
    description:
      'Returns all regularization requests for the specified student.',
  })
  @ApiResponse({
    status: 404,
    description: 'No regularization requests found.',
  })
  getRegularizationRequestsTeacher(
    @LoginUser('userId') teacherId: Types.ObjectId,
  ) {
    return this.attendanceService.getRegularizationRequestsTeacher(teacherId);
  }

  @Patch('/regularization/approve-or-reject/:id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve or reject a regularization request' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID of the regularization request',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['approved', 'rejected'] },
        comment: { type: 'string' },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The regularization request has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 404,
    description: 'Regularization request not found.',
  })
  approveOrRejectRegularizationRequest(
    @Param('id') id: string,
    @Body()
    approvalData: {
      status: 'approved' | 'rejected';
      type: 'halfDay' | 'fullDay';
    },
    @LoginUser('userId') teacherId: Types.ObjectId,
  ) {
    console.log(id, approvalData, teacherId, 'id, approvalData, teacherId');
    return this.attendanceService.approveOrRejectRegularizationRequest(
      id,
      approvalData.status,
      approvalData.type,
      teacherId,
    );
  }

  @Get('/classroom/:classId/date/:date')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get attendance details for a classroom on a specific date' })
  @ApiParam({ name: 'classId', type: 'string', description: 'ID of the class' })
  @ApiParam({ name: 'date', type: 'string', description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({
    status: 200,
    description: 'Returns attendance details for the specified classroom and date.',
  })
  @ApiResponse({ status: 404, description: 'Class not found or no attendance records for the specified date.' })
  getClassroomAttendanceByDate(
    @Param('classId') classId: string,
    @Param('date') date: string,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.attendanceService.getClassroomAttendanceByDate(classId, date, schoolId);
  }
}

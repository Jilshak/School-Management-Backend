import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, CreateAttendanceDto, CreateLeaveDto, CreatePayrollDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'The employee has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateEmployeeDto })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Return all employees.' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by id' })
  @ApiResponse({ status: 200, description: 'Return the employee.' })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Employee ID' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiResponse({ status: 200, description: 'The employee has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Employee ID' })
  @ApiBody({ type: UpdateEmployeeDto })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiResponse({ status: 200, description: 'The employee has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Employee not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Employee ID' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Post('attendance')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create employee attendance' })
  @ApiResponse({ status: 201, description: 'The attendance has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateAttendanceDto })
  createAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.employeesService.createAttendance(createAttendanceDto);
  }

  @Get('attendance')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get all employee attendance records' })
  @ApiResponse({ status: 200, description: 'Return all attendance records.' })
  getAllAttendance() {
    return this.employeesService.getAllAttendance();
  }

  @Get('attendance/:id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get an employee attendance record by id' })
  @ApiResponse({ status: 200, description: 'Return the attendance record.' })
  @ApiResponse({ status: 404, description: 'Attendance record not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Attendance ID' })
  getAttendance(@Param('id') id: string) {
    return this.employeesService.getAttendance(id);
  }

  @Post('leave')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create employee leave request' })
  @ApiResponse({ status: 201, description: 'The leave request has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateLeaveDto })
  createLeave(@Body() createLeaveDto: CreateLeaveDto) {
    return this.employeesService.createLeave(createLeaveDto);
  }

  @Get('leave')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get all employee leave requests' })
  @ApiResponse({ status: 200, description: 'Return all leave requests.' })
  getAllLeave() {
    return this.employeesService.getAllLeave();
  }

  @Get('leave/:id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get an employee leave request by id' })
  @ApiResponse({ status: 200, description: 'Return the leave request.' })
  @ApiResponse({ status: 404, description: 'Leave request not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Leave request ID' })
  getLeave(@Param('id') id: string) {
    return this.employeesService.getLeave(id);
  }

  @Post('payroll')
  @Roles('admin')
  @ApiOperation({ summary: 'Create employee payroll' })
  @ApiResponse({ status: 201, description: 'The payroll has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreatePayrollDto })
  createPayroll(@Body() createPayrollDto: CreatePayrollDto) {
    return this.employeesService.createPayroll(createPayrollDto);
  }

  @Get('payroll')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all employee payroll records' })
  @ApiResponse({ status: 200, description: 'Return all payroll records.' })
  getAllPayroll() {
    return this.employeesService.getAllPayroll();
  }

  @Get('payroll/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get an employee payroll record by id' })
  @ApiResponse({ status: 200, description: 'Return the payroll record.' })
  @ApiResponse({ status: 404, description: 'Payroll record not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Payroll ID' })
  getPayroll(@Param('id') id: string) {
    return this.employeesService.getPayroll(id);
  }
}
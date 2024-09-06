import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, CreateAttendanceDto, CreateLeaveDto, CreatePayrollDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles('admin')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  // Employee Attendance
  @Post('attendance')
  @Roles('admin', 'teacher')
  createAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.employeesService.createAttendance(createAttendanceDto);
  }

  @Get('attendance')
  @Roles('admin', 'teacher')
  getAllAttendance() {
    return this.employeesService.getAllAttendance();
  }

  @Get('attendance/:id')
  @Roles('admin', 'teacher')
  getAttendance(@Param('id') id: string) {
    return this.employeesService.getAttendance(id);
  }

  // Employee Leave
  @Post('leave')
  @Roles('admin', 'teacher')
  createLeave(@Body() createLeaveDto: CreateLeaveDto) {
    return this.employeesService.createLeave(createLeaveDto);
  }

  @Get('leave')
  @Roles('admin', 'teacher')
  getAllLeave() {
    return this.employeesService.getAllLeave();
  }

  @Get('leave/:id')
  @Roles('admin', 'teacher')
  getLeave(@Param('id') id: string) {
    return this.employeesService.getLeave(id);
  }

  // Employee Payroll
  @Post('payroll')
  @Roles('admin')
  createPayroll(@Body() createPayrollDto: CreatePayrollDto) {
    return this.employeesService.createPayroll(createPayrollDto);
  }

  @Get('payroll')
  @Roles('admin')
  getAllPayroll() {
    return this.employeesService.getAllPayroll();
  }

  @Get('payroll/:id')
  @Roles('admin')
  getPayroll(@Param('id') id: string) {
    return this.employeesService.getPayroll(id);
  }
}
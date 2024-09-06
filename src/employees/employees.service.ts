import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Employee } from 'src/domains/schema/employees.schema';
import { Attendance } from 'src/domains/schema/attendance.schema';
import { Leave } from 'src/domains/schema/leave.schema';
import { Payroll } from 'src/domains/schema/payroll.schema';
import { CreateEmployeeDto, UpdateEmployeeDto, CreateAttendanceDto, CreateLeaveDto, CreatePayrollDto } from './dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    @InjectModel(Leave.name) private leaveModel: Model<Leave>,
    @InjectModel(Payroll.name) private payrollModel: Model<Payroll>,
    @InjectConnection() private connection: Connection
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdEmployee = new this.employeeModel(createEmployeeDto);
      const result = await createdEmployee.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create employee');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Employee[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const employees = await this.employeeModel.find().session(session).exec();
      await session.commitTransaction();
      return employees;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch employees');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<Employee> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const employee = await this.employeeModel.findById(id).session(session).exec();
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      await session.commitTransaction();
      return employee;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch employee');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedEmployee = await this.employeeModel.findByIdAndUpdate(id, updateEmployeeDto, { new: true, session }).exec();
      if (!updatedEmployee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedEmployee;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update employee');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.employeeModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove employee');
    } finally {
      session.endSession();
    }
  }

  // Employee Attendance
  async createAttendance(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdAttendance = new this.attendanceModel(createAttendanceDto);
      const result = await createdAttendance.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create attendance');
    } finally {
      session.endSession();
    }
  }

  async getAllAttendance(): Promise<Attendance[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const attendance = await this.attendanceModel.find().session(session).exec();
      await session.commitTransaction();
      return attendance;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch attendance');
    } finally {
      session.endSession();
    }
  }

  async getAttendance(id: string): Promise<Attendance> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const attendance = await this.attendanceModel.findById(id).session(session).exec();
      if (!attendance) {
        throw new NotFoundException(`Attendance with ID ${id} not found`);
      }
      await session.commitTransaction();
      return attendance;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch attendance');
    } finally {
      session.endSession();
    }
  }

  // Employee Leave
  async createLeave(createLeaveDto: CreateLeaveDto): Promise<Leave> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdLeave = new this.leaveModel(createLeaveDto);
      const result = await createdLeave.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create leave');
    } finally {
      session.endSession();
    }
  }

  async getAllLeave(): Promise<Leave[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const leave = await this.leaveModel.find().session(session).exec();
      await session.commitTransaction();
      return leave;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch leave');
    } finally {
      session.endSession();
    }
  }

  async getLeave(id: string): Promise<Leave> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const leave = await this.leaveModel.findById(id).session(session).exec();
      if (!leave) {
        throw new NotFoundException(`Leave with ID ${id} not found`);
      }
      await session.commitTransaction();
      return leave;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch leave');
    } finally {
      session.endSession();
    }
  }

  // Employee Payroll
  async createPayroll(createPayrollDto: CreatePayrollDto): Promise<Payroll> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdPayroll = new this.payrollModel(createPayrollDto);
      const result = await createdPayroll.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create payroll');
    } finally {
      session.endSession();
    }
  }

  async getAllPayroll(): Promise<Payroll[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const payroll = await this.payrollModel.find().session(session).exec();
      await session.commitTransaction();
      return payroll;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch payroll');
    } finally {
      session.endSession();
    }
  }

  async getPayroll(id: string): Promise<Payroll> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const payroll = await this.payrollModel.findById(id).session(session).exec();
      if (!payroll) {
        throw new NotFoundException(`Payroll with ID ${id} not found`);
      }
      await session.commitTransaction();
      return payroll;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch payroll');
    } finally {
      session.endSession();
    }
  }
}
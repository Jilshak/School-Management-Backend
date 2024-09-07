import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Employee } from '../domains/schema/employee.schema';
import { Attendance } from '../domains/schema/attendance.schema';
import { Leave } from '../domains/schema/leave.schema';
import { Payroll } from '../domains/schema/payroll.schema';
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

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdEmployee = new this.employeeModel(createEmployeeDto);
      const result = await createdEmployee.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create employee');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().exec();
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(id).exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedEmployee = await this.employeeModel.findByIdAndUpdate(id, updateEmployeeDto, { new: true, session }).exec();
      if (!updatedEmployee) {
        throw new NotFoundException(`Employee with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedEmployee;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update employee');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.employeeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }

  async createAttendance(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const createdAttendance = new this.attendanceModel(createAttendanceDto);
    return createdAttendance.save();
  }

  async getAllAttendance(): Promise<Attendance[]> {
    return this.attendanceModel.find().exec();
  }

  async getAttendance(id: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.findById(id).exec();
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  async createLeave(createLeaveDto: CreateLeaveDto): Promise<Leave> {
    const createdLeave = new this.leaveModel(createLeaveDto);
    return createdLeave.save();
  }

  async getAllLeave(): Promise<Leave[]> {
    return this.leaveModel.find().exec();
  }

  async getLeave(id: string): Promise<Leave> {
    const leave = await this.leaveModel.findById(id).exec();
    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }
    return leave;
  }

  async createPayroll(createPayrollDto: CreatePayrollDto): Promise<Payroll> {
    const createdPayroll = new this.payrollModel(createPayrollDto);
    return createdPayroll.save();
  }

  async getAllPayroll(): Promise<Payroll[]> {
    return this.payrollModel.find().exec();
  }

  async getPayroll(id: string): Promise<Payroll> {
    const payroll = await this.payrollModel.findById(id).exec();
    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }
    return payroll;
  }
}
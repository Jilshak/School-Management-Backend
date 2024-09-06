import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee, EmployeeSchema } from 'src/domains/schema/employee.schema';
import { Attendance, AttendanceSchema } from 'src/domains/schema/attendance.schema';
import { Leave, LeaveSchema } from 'src/domains/schema/leave.schema';
import { Payroll, PayrollSchema } from 'src/domains/schema/payroll.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Leave.name, schema: LeaveSchema },
      { name: Payroll.name, schema: PayrollSchema },
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
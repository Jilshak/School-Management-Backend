import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { Employee, EmployeeSchema } from '../domains/schema/employee.schema';
import { Attendance, AttendanceSchema } from '../domains/schema/attendance.schema';
import { Leave, LeaveSchema } from '../domains/schema/leave.schema';
import { Payroll, PayrollSchema } from '../domains/schema/payroll.schema';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Leave.name, schema: LeaveSchema },
      { name: Payroll.name, schema: PayrollSchema },
    ]),
    GuardsModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
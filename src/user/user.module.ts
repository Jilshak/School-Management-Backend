import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../domains/schema/user.schema';
import { Student, StudentSchema } from '../domains/schema/students.schema';
import { Employee, EmployeeSchema } from '../domains/schema/employee.schema';
import { Admission, AdmissionSchema } from '../domains/schema/admission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Admission.name, schema: AdmissionSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
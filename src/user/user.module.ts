import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../domains/schema/user.schema';
import { Student, StudentSchema } from '../domains/schema/students.schema';
import { Staff, StaffSchema } from '../domains/schema/staff.schema';
import { Admission, AdmissionSchema } from '../domains/schema/admission.schema';
import { School, SchoolSchema } from '../domains/schema/school.schema';
import { SchoolType, SchoolTypeSchema } from '../domains/schema/school-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Admission.name, schema: AdmissionSchema },
      { name: School.name, schema: SchoolSchema },
      { name: SchoolType.name, schema: SchoolTypeSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
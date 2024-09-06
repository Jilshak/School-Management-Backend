import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../domains/schema/user.schema';
import { Student, StudentSchema } from '../domains/schema/students.schema';
import { Staff, StaffSchema } from '../domains/schema/staff.schema';
import { Admission, AdmissionSchema } from '../domains/schema/admission.schema';
import { RolesGuard } from '../shared/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Admission.name, schema: AdmissionSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, RolesGuard],
})
export class UserModule {}
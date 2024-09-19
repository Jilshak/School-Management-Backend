import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../domains/schema/user.schema';
import { Student, StudentSchema } from '../domains/schema/students.schema';
import { Staff, StaffSchema } from '../domains/schema/staff.schema';
import { Teacher, TeacherSchema } from '../domains/schema/teacher.schema';
import { Subject, SubjectSchema } from '../domains/schema/subject.schema';
import { GuardsModule } from '../guards/guards.module';
import { Classroom, ClassroomSchema } from 'src/domains/schema/classroom.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Classroom.name, schema: ClassroomSchema },
    ]),
    GuardsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
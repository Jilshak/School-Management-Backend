import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  HALF_DAY = 'halfday'
}

@Schema()
class StudentAttendance {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: String, enum: AttendanceStatus, required: true })
  status: AttendanceStatus;
}

@Schema({timestamps:true})
export class Attendance {
  @Prop({ required: true })
  attendanceDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Classroom', required: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: [StudentAttendance], required: true })
  studentsAttendance: StudentAttendance[];
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
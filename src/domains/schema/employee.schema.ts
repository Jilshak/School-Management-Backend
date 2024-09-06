import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Employee extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  dateOfJoining: Date;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  address: string;

  @Prop()
  qualification: string;

  @Prop()
  experience: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attendance' }] })
  attendanceRecords: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Leave' }] })
  leaveRecords: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Payroll' }] })
  payrollRecords: Types.ObjectId[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
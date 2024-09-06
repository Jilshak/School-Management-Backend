import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EmployeeRole } from 'src/auth/enums/auth.enums';

@Schema()
export class Employee extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true, enum: EmployeeRole })
  role: EmployeeRole;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  address: string;

  @Prop({ type: [String], required: false })
  qualifications: string[];

  @Prop({ required: false })
  experience: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

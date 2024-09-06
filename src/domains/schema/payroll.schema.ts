import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Payroll extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  payPeriodStart: Date;

  @Prop({ required: true })
  payPeriodEnd: Date;

  @Prop({ required: true })
  basicSalary: number;

  @Prop({ required: true })
  allowances: number;

  @Prop({ required: true })
  deductions: number;

  @Prop({ required: true })
  netSalary: number;

  @Prop()
  remarks: string;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({timestamps:true})
export class Payroll extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, default: new Date() })
  date: Date;

  @Prop({ required: true,type:Number })
  paid: number;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: Number,required: true })
  baseSalary: number;

  @Prop()
  remarks: string;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);
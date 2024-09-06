import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Leave extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop()
  approvedBy: Types.ObjectId;

  @Prop()
  remarks: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
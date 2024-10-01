import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({timestamps:true})
export class Leave extends Document {

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'],default:"pending" })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'Classroom', required: true })
  classId: Types.ObjectId;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
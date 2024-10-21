import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class AttendanceRegularization extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AttendanceRecord', required: true })
  attendanceId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  studentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop()
  reviewedAt: Date;

  @Prop()
  studentName: string;

  @Prop()
  type: "fullDay" | "halfDay";
}

export const AttendanceRegularizationSchema = SchemaFactory.createForClass(AttendanceRegularization);

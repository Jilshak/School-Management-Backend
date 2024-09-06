import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimeTableDocument = TimeTable & Document;

@Schema()
export class TimeTable {
  @Prop({ type: Types.ObjectId, ref: 'Classroom', required: true })
  classroomId: Types.ObjectId;

  @Prop({ required: true })
  day: string;

  @Prop({ type: [{ period: Number, subjectId: { type: Types.ObjectId, ref: 'Subject' } }] })
  schedule: { period: number; subjectId: Types.ObjectId }[];
}

export const TimeTableSchema = SchemaFactory.createForClass(TimeTable);

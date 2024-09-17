import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimeTableDocument = TimeTable & Document;

enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

@Schema()
class TimeSlot {
  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
  teacherId: Types.ObjectId;
}

@Schema()
export class TimeTable {
  @Prop({ type: Types.ObjectId, ref: 'Classroom', required: true })
  classId: Types.ObjectId;

  @Prop({ type: [TimeSlot], required: true })
  monday: TimeSlot[];

  @Prop({ type: [TimeSlot], required: true })
  tuesday: TimeSlot[];

  @Prop({ type: [TimeSlot], required: true })
  wednesday: TimeSlot[];

  @Prop({ type: [TimeSlot], required: true })
  thursday: TimeSlot[];

  @Prop({ type: [TimeSlot], required: true })
  friday: TimeSlot[];

  @Prop({ type: [TimeSlot], required: true })
  saturday: TimeSlot[];

  @Prop({required:true,type:Types.ObjectId})
  schoolId:Types.ObjectId
}

export const TimeTableSchema = SchemaFactory.createForClass(TimeTable);

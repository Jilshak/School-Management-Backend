import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class ClassDailyRecord extends Document {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, type: Types.ObjectId })
  classroomId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  schoolId: Types.ObjectId;

  @Prop([{
    teacherId: { type: Types.ObjectId, required: true },
    subjectId: { type: Types.ObjectId, required: true },
    topics: { type: [String], default: [] },
    activities: { type: [String], default: [] },
    homework: { type: [String], default: [] },
  }])
  entries: {
    teacherId: Types.ObjectId;
    subjectId: Types.ObjectId;
    topics: string[];
    activities: string[];
    homework: string[];
  }[];
}

export const ClassDailyRecordSchema = SchemaFactory.createForClass(ClassDailyRecord);
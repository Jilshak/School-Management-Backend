import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
class Entry {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Classroom' })
  classroomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Subject' })
  subjectId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  topics: string[];

  @Prop({ type: [String], default: [] })
  activities: string[];

  @Prop({ type: [String], default: [] })
  homework: string[];
}

@Schema({ timestamps: true }) 
export class WorkDoneBook extends Document {
  @Prop({ required: true })
  date: Date;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  teacherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'School' })
  schoolId: Types.ObjectId;

  @Prop({ type: [Entry], required: true })
  entries: Entry[];
}

export const WorkDoneBookSchema = SchemaFactory.createForClass(WorkDoneBook);
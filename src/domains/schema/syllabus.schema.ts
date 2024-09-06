import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SyllabusDocument = Syllabus & Document;

@Schema()
export class Syllabus {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String] })
  topics: string[];
}

export const SyllabusSchema = SchemaFactory.createForClass(Syllabus);
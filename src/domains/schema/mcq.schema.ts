import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MCQ extends Document {
  @Prop({ required: true, type: String })
  question: string;

  @Prop({ required: true, type: [String] })
  options: string[];

  @Prop({ required: true, type: Number })
  correctAnswer: number;

  @Prop({ type: Types.ObjectId, ref: 'Syllabus', required: true })
  syllabusId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  chapterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const MCQSchema = SchemaFactory.createForClass(MCQ);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
class Chapter {


  @Prop({ required: true,type:String })
  chapterName: string;


  @Prop({ required: true,type:String })
  filePath: string;

  @Prop({ required: false,type:String })
  description: string;

  @Prop({ required: false,type:Number })
  hours: number;
}

@Schema()
class Subject {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: [Chapter], required: true })
  chapters: Chapter[];
}

@Schema({ timestamps: true })
export class Syllabus extends Document {
  @Prop({ required: true,type:String })
  syllabusName: string;

  @Prop({ type: [Subject], required: true })
  subjects: Subject[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Classroom' }], required: true })
  assignedClasses: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const SyllabusSchema = SchemaFactory.createForClass(Syllabus);

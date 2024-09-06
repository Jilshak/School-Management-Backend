import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudyMaterialDocument = StudyMaterial & Document;

@Schema()
export class StudyMaterial {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  uploadDate: Date;
}

export const StudyMaterialSchema = SchemaFactory.createForClass(StudyMaterial);
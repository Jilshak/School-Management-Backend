import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema()
export class Subject {
  @Prop({ required: true,unique:true })
  name: string;

  @Prop({required:true,unique:true})
  code: string;

  @Prop({required:true,ref:"School"})
  schoolId:Types.ObjectId

}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

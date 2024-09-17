import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema()
export class Teacher {
  @Prop([{ type: [Types.ObjectId], ref: 'Subject' }])
  subjects: Array<Types.ObjectId>

  @Prop({ type: Types.ObjectId, ref: 'User',unique:true })
  userId: Types.ObjectId;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
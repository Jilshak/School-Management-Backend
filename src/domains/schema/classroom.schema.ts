import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassroomDocument = Classroom & Document;

@Schema()
export class Classroom {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  classTeacherId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Subject' }] })
  subjects: Types.ObjectId[];
  
  @Prop({ required: true })
  academicYear: string;

  @Prop({required:true,type:Types.ObjectId,ref:'School'})
  schoolId:Types.ObjectId;

  @Prop({type:Boolean,default:true})
  isActive:boolean;
}

export const ClassroomSchema = SchemaFactory.createForClass(Classroom);
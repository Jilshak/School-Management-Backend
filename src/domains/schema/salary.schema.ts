import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Salary {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  baseSalary: number;

 @Prop({required:true,type:Types.ObjectId,ref:"School"})
 schoolId:Types.ObjectId
}

export type SalaryDocument = Salary & Document;
export const SalarySchema = SchemaFactory.createForClass(Salary);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({timestamps:true})
export class Expense {
  @Prop({ required: true })
  description: string;

  @Prop({required: true,type:Types.ObjectId,ref:"School" })
  schoolId:Types.ObjectId

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true,type:Types.ObjectId,ref:"ExpenseCategory" })
  category: Types.ObjectId;

  @Prop({ required: true,type:Types.ObjectId,ref:"User" })
  createdBy: Types.ObjectId;

  @Prop({ required: true ,type:Types.ObjectId,ref:"User" })
  updatedBy: Types.ObjectId;

  @Prop({required:true,default:true})
  isActive:boolean
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

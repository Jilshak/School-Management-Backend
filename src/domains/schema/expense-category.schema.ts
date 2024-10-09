import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseCategoryDocument = ExpenseCategory & Document;

@Schema({ timestamps: true })
export class ExpenseCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'School' })
  schoolId: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const ExpenseCategorySchema = SchemaFactory.createForClass(ExpenseCategory);

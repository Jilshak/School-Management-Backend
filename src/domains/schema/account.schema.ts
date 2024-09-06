import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Account extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['bill_receipt', 'fee_structure', 'student_due_date', 'salary_management'] })
  type: string;

  // Add more fields as needed
}

export const AccountSchema = SchemaFactory.createForClass(Account);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class PaymentDue extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description: string;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ required: true, type: Boolean, default: false })
  isPaid: boolean;

  @Prop({ type: Date, default: Date.now, immutable: true })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, immutable: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "School" })
  schoolId: Types.ObjectId;
}

export const PaymentDueSchema = SchemaFactory.createForClass(PaymentDue);

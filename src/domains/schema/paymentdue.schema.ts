import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentDue extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: [{ 
    feeType: { type: Types.ObjectId, ref: 'FeeType' },
    name: String,
    amount: Number,
    count: Number,
    description: String
  }] })
  feeDetails: Array<{
    feeType: Types.ObjectId;
    name: string;
    amount: number;
    count: number;
    description: string;
  }>;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ required: true, type: Boolean, default: false })
  isPaid: boolean;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, immutable: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "School" })
  schoolId: Types.ObjectId;
}

export const PaymentDueSchema = SchemaFactory.createForClass(PaymentDue);

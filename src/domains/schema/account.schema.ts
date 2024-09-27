import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
class FeeDetail {
  @Prop({ required: false, type: Types.ObjectId })
  feeTypeId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: false, min: 1 })
  quantity?: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'PaymentDue', required: false })
  dueDateId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false })
  duePaymentId?: Types.ObjectId;
}

@Schema({timestamps:true})
export class Account extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Student',immutable:true })
  studentId: Types.ObjectId;

  @Prop({ required: true, type: [FeeDetail] })
  fees: FeeDetail[];


  @Prop({ required: true,default:Date.now })
  paymentDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true,immutable:true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true,immutable:true })
  schoolId: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: false })
  paymentMode: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Payments extends Document {
  @Prop({ required: true,type:Types.ObjectId,default:new Types.ObjectId(),ref:"PaymentDue" })
  paymentId: Types.ObjectId;

  @Prop({ required: true,type:String })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description: string;

  @Prop({ required: true, type:Date })
  date: Date;

  @Prop({required:true,type:Boolean,default:false})
  isDue:boolean

  @Prop({ type: Date, default: Date.now,immutable:true })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: "User", required: true,immutable:true })
  createdBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;
}

export class Account extends Document {
  @Prop({ required: true,type:Types.ObjectId,ref:"User" })
  userId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now,immutable:true })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: "User", required: true,immutable:true })
  createdBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: "User" })
  updatedBy: Types.ObjectId;

  // Add more fields as needed
}

export const AccountSchema = SchemaFactory.createForClass(Account);
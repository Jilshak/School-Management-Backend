import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
class PaymentDetails {
  @Prop({ required: true })
  fee: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  amount: number;
}

@Schema()
export class Admission extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [PaymentDetails], required: true })
  paymentDetails: PaymentDetails[];
}

export const AdmissionSchema = SchemaFactory.createForClass(Admission);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FeeType extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description?: string;
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const FeeTypeSchema = SchemaFactory.createForClass(FeeType);

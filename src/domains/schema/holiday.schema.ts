import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HolidayDocument = Holiday & Document;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'School',required:true,immutable:true })
  schoolId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);


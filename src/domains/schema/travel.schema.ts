import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TravelDocument = Travel & Document;

@Schema()
export class Travel {
  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  purpose: string;

  @Prop()
  transportation: string;
}

export const TravelSchema = SchemaFactory.createForClass(Travel);
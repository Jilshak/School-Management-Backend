import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessDocument = Mess & Document;

@Schema()
export class Mess {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  meal: string;

  @Prop({ required: true })
  menu: string[];

  @Prop()
  specialDiet: string[];
}

export const MessSchema = SchemaFactory.createForClass(Mess);
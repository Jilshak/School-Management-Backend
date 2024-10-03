import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({timestamps:true})
export class Event {
  @Prop({ required: true,type:String })
  title: string;

  @Prop({ required: true,type:String })
  description: string;

  @Prop({ required: true,type:Date })
  startDate: Date;

  @Prop({ required: true,type:Date })
  endDate: Date;

  @Prop({ required: true,type:Types.ObjectId,ref:'School' })
  schoolId: Types.ObjectId;
}

export const EventSchema = SchemaFactory.createForClass(Event);
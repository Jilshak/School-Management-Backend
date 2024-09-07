import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Class } from './class.schema';

@Schema()
export class School extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Class' }] })
  classes: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'SchoolType', required: true })
  schoolTypeId: Types.ObjectId;
}

export const SchoolSchema = SchemaFactory.createForClass(School);

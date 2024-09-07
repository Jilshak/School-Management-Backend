import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchoolTypeDocument = SchoolType & Document;

@Schema()
export class SchoolType {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description: string;
}

export const SchoolTypeSchema = SchemaFactory.createForClass(SchoolType);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Section } from './section.schema';

@Schema()
export class Class extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Section' }] })
  sections: Types.ObjectId[];

  // Add other properties as needed
}

export const ClassSchema = SchemaFactory.createForClass(Class);
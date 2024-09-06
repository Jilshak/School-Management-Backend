import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Class extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  grade: number;

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Section' }] })
  sections: Types.ObjectId[];
}

export const ClassSchema = SchemaFactory.createForClass(Class);
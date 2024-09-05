import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Class extends Document {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true })
  className: string;

  @Prop({ required: true })
  classTeacherId: Types.ObjectId;

  @Prop({ required: true })
  classRoom: string;

  @Prop({ type: [Types.ObjectId], ref: 'Subject', required: true })
  subjects: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

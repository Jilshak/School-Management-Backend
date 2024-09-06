import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true, unique: true })
  isbn: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['available', 'lent', 'reserved'] })
  status: string;

  @Prop({ enum: ['physical', 'digital'] })
  format: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lentTo: Types.ObjectId;

  @Prop()
  lentDate: Date;

  @Prop()
  dueDate: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);
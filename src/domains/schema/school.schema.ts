import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SchoolType } from 'src/auth/enums/auth.enums';

@Schema()
export class School extends Document {
  @Prop({ required: true })
  schoolName: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true }) // Address of the school    
  address: string;

  @Prop({ required: true })
  schoolCode: string;

  @Prop({ required: true, enum: SchoolType })
  type: string; // ["1", "2", "3", "4"]
}

export const SchoolSchema = SchemaFactory.createForClass(School);

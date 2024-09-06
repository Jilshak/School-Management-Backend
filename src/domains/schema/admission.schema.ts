import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdmissionDocument = Admission & Document;

@Schema()
export class Admission {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  appliedClass: string;

  @Prop()
  parentName: string;

  @Prop()
  previousSchool: string;

  @Prop({ default: 'Pending' })
  status: string;
}

export const AdmissionSchema = SchemaFactory.createForClass(Admission);
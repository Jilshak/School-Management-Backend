import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class School extends Document {
  @ApiProperty({ example: 'Springfield Elementary' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 'California' })
  @Prop({ required: true })
  state: string;

  @ApiProperty({ example: 'Springfield District' })
  @Prop({ required: true })
  district: string;

  @ApiProperty({ example: '123 School St, Springfield, CA 12345' })
  @Prop({ required: true })
  address: string;

  @ApiProperty({ example: 'SPR001' })
  @Prop({ required: true, unique: true })
  schoolCode: string;

  @ApiProperty({ example: 'info@springfield.edu' })
  @Prop({required: true})
  email: string;

  @ApiProperty({ example: '66dd4d0b37ffe76802c255e4' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SchoolType', required: true })
  schoolTypeId: MongooseSchema.Types.ObjectId;

  @ApiProperty({ example: '555-1234' })
  @Prop({ required: true })
  primaryPhone: string;

  @ApiProperty({ example: '555-5678', required: false })
  @Prop()
  secondaryPhone: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  @Prop({required: true})
  schoolLogo: string;

}

export const SchoolSchema = SchemaFactory.createForClass(School);

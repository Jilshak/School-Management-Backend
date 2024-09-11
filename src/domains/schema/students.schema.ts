import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Gender } from '../enums/gender.enum';

@Schema()
class ParentsDetails {
  @Prop({ required: true })
  guardianName: string;

  @Prop({ required: true })
  guardianContactNumber: string;

  @Prop({ required: true })
  relationshipToStudent: string;
}

@Schema()
export class Student extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop()
  nationality: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop()
  state: string;

  @Prop()
  address: string;

  @Prop({ required: true, default: Date.now() })
  joinDate: Date;

  @Prop({ required: true, unique: true })
  enrollmentNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classId: MongooseSchema.Types.ObjectId;


  @Prop({ type: ParentsDetails, required: true })
  parentsDetails: ParentsDetails;

  @Prop()
  adhaarNumber: string;

  @Prop()
  adhaarDocument: string;

  @Prop()
  birthCertificateDocument: string;

  @Prop()
  tcNumber: string;

  @Prop()
  tcDocument: string;

  @Prop({ required: true })
  emergencyContactName: string;

  @Prop({ required: true })
  emergencyContactNumber: string;

  @Prop({  default: true })
  isActive: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

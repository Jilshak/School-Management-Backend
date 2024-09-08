import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Gender } from '../enums/gender.enum';

@Schema()
class ParentsDetails {
  @Prop({ required: true })
  guardianName: string;

  @Prop({ required: true })
  guardianContactNumber: string;

  @Prop()
  guardianEmail?: string;

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

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  admissionDate: Date;

  @Prop({ required: true })
  grade: string;

  @Prop()
  section?: string;

  @Prop({ required: true, unique: true })
  enrollmentNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classID: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'School', required: true })
  schoolID: MongooseSchema.Types.ObjectId;

  @Prop({ type: ParentsDetails, required: true })
  parentsDetails: ParentsDetails;

  @Prop()
  adhaar?: string;

  @Prop({ required: true })
  emergencyContactName: string;

  @Prop({ required: true })
  emergencyContactNumber: string;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

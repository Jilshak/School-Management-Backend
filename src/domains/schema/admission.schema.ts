import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Gender } from '../enums/gender.enum';

@Schema()
class GuardianDetails {
  @Prop({ required: true })
  guardianName: string;

  @Prop({ required: true })
  guardianContactNumber: string;

  @Prop({ required: true })
  relationshipToStudent: string;
}

@Schema()
class EmergencyContact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  contactNumber: string;
}

@Schema()
class PaymentDetails {
  @Prop({ required: true })
  fee: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  amount: number;
}

@Schema()
export class Admission extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  adhaarNumber?: string;

  @Prop()
  adhaarDocument?: string; // Store file path or URL

  @Prop()
  birthCertificateNumber?: string;

  @Prop()
  birthCertificateDocument?: string; // Store file path or URL

  @Prop()
  tcNumber?: string;

  @Prop()
  tcDocument?: string; // Store file path or URL

  @Prop({ required: true })
  joinDate: Date;

  @Prop({ required: true, unique: true })
  enrollmentNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ type: GuardianDetails, required: true })
  guardianDetails: GuardianDetails;

  @Prop({ type: EmergencyContact, required: true })
  emergencyContact: EmergencyContact;

  @Prop({ type: [PaymentDetails], required: true })
  paymentDetails: PaymentDetails[];

  @Prop({ required: true })
  totalPayment: number;

  @Prop()
  profilePicture?: string; // Store file path or URL

  @Prop({ required: true, default: false })
  isAdmitted: boolean;
}

export const AdmissionSchema = SchemaFactory.createForClass(Admission);
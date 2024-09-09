import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema()
export class Teacher {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: ['male', 'female', 'other'] })
  gender: 'male' | 'female' | 'other';

  @Prop()
  contactNumber: string;


  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop()
  nationality: string;

  @Prop()
  state: string;

  @Prop()
  address: string;

  @Prop()
  adhaarNumber: string;

  @Prop()
  adhaarDocument: string; // URL or file path

  @Prop()
  pancardNumber: string;

  @Prop()
  pancardDocument: string; // URL or file path

  @Prop({ required: true })
  joinDate: Date;

  @Prop([{
    document: String,
    instituteName: String,
    degree: String,
    fieldOfStudy: String,
    yearOfPass: Number,
    gradePercentage: String
  }])
  qualifications: Array<{
    document: string;
    instituteName: string;
    degree: string;
    fieldOfStudy: string;
    yearOfPass: number;
    gradePercentage: string;
  }>;

  @Prop([{
    certificate: String,
    issueAuthority: String,
    issueDate: Date
  }])
  certificates: Array<{
    certificate: string;
    issueAuthority: string;
    issueDate: Date;
  }>;

  @Prop([{
    document: String,
    publicationName: String,
    publicationDate: Date,
    linkUrl: String
  }])
  publications: Array<{
    document: string;
    publicationName: string;
    publicationDate: Date;
    linkUrl: string;
  }>;

  @Prop([{
    document: String,
    instituteName: String,
    role: String,
    joinedDate: Date,
    revealedDate: Date,
    yearsOfExperience: Number
  }])
  previousEmployments: Array<{
    document: string;
    instituteName: string;
    role: string;
    joinedDate: Date;
    revealedDate: Date;
    yearsOfExperience: number;
  }>;

  @Prop()
  emergencyContactName: string;

  @Prop()
  emergencyContactNumber: string;


  @Prop([{ type: [Types.ObjectId], ref: 'Subject' }])
  subjects: Array<Types.ObjectId>

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
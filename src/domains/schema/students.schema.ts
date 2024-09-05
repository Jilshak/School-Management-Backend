import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Gender } from 'src/auth/enums/auth.enums';

@Schema()
export class Student extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender; // [Male, Female, Other]

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classId: Types.ObjectId;

  @Prop({ required: true })
  address: string;

  @Prop({
    guardianName: { type: String, required: true },
    guardianContactNumber: { type: String, required: true },
    guardianEmail: { type: String },
    relationshipToStudent: { type: String, required: true },
  })
  guardianDetails: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

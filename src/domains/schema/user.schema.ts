import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from 'src/auth/enums/auth.enums';



@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: string;

  @Prop({ required: true })
  userType: string;

  @Prop()
  studentId: string;

  @Prop()
  employeeId: string;

  @Prop({ required: true })
  roleId: string;

  @Prop({ required: true })
  schoolId: string;

  @Prop({ required: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

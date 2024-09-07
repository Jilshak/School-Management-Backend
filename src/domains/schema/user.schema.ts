import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserRole } from 'src/auth/enums/auth.enums';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'School', required: true })
  schoolId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', required: true })
  roleId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: UserRole })
  userType: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

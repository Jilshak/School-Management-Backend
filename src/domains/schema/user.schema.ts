import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  roleId: MongooseSchema.Types.ObjectId;

  // Add other user properties as needed
}

export const UserSchema = SchemaFactory.createForClass(User);

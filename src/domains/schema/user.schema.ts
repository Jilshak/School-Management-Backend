import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserRole } from '../enums/user-roles.enum';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.STUDENT] })
  roles: UserRole[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'School',
    validate: {
      validator: async function (value) {
        const Classroom = this.model('School');
        const classroom = await Classroom.findById(value);
        if (!classroom) {
          throw new Error('School does not exist');
        }
        return true;
      },
      message: 'School does not exist',
    },
  })
  schoolId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Classroom',
    validate: {
      validator: async function (value) {
        const Classroom = this.model('Classroom');
        const classroom = await Classroom.findById(value);
        if (!classroom) {
          throw new Error('Classroom does not exist');
        }
        return true;
      },
      message: 'Classroom does not exist',
    },
  })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

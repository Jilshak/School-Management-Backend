import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClassTest extends Document {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Subject' })
  subjectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Classroom',immutable:true })
  classId: Types.ObjectId;

  @Prop({required:true,type:Number})
  totalMark:number;

  @Prop({ required: true, type: Types.ObjectId})
  periods: Types.ObjectId[];

  @Prop({ type: String })
  description?: string;

  @Prop({
    type:Types.ObjectId,
    ref: 'School',
    immutable:true,
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
  schoolId:Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ClassTestSchema = SchemaFactory.createForClass(ClassTest);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
class ExamDetail {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subject', required: true })
  subjectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop()
  description: string;
}

const ExamDetailSchema = SchemaFactory.createForClass(ExamDetail);

@Schema({ timestamps: true })
export class SemExam extends Document {
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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  classId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [ExamDetailSchema], required: true })
  exams: ExamDetail[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const SemExamSchema = SchemaFactory.createForClass(SemExam);

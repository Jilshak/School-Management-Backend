import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class LessonPlanEntry {
  @Prop({ type: Types.ObjectId, required: true })
  classroomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  topics: string[];

  @Prop({ type: [String], default: [] })
  activities: string[];

  @Prop({ type: [String], default: [] })
  chapters: string[];

  @Prop({ type: [String], default: [] })
  objectives: string[];

  @Prop({ type: [String], default: [] })
  corePoints: string[];

  @Prop({ type: [String], default: [] })
  evaluations: string[];

  @Prop({ type: [String], default: [] })
  learningOutcomes: string[];
}

@Schema({ timestamps: true })
export class LessonPlan extends Document {
  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Types.ObjectId, required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  schoolId: Types.ObjectId;

  @Prop({ type: [LessonPlanEntry], default: [] })
  entries: LessonPlanEntry[];
}

export const LessonPlanSchema = SchemaFactory.createForClass(LessonPlan);

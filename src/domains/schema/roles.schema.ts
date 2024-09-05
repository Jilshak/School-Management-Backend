import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Role extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Subject', required: true })
  subjects: Types.ObjectId[];

  @Prop({
    type: Map,
    of: [{ subjectId: Types.ObjectId, teacherId: Types.ObjectId, period: Number }],
  })
  days: Map<string, { subjectId: Types.ObjectId; teacherId: Types.ObjectId; period: number }[]>;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

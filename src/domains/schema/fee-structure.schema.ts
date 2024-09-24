import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class FeeType {
  @Prop({ required: true,type:MongooseSchema.Types.ObjectId,ref:'FeeType' })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  count: number;

  @Prop()
  description: string;
}

@Schema({timestamps: true})
export class FeeStructure extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['monthly', 'bimonthly', 'quarterly', 'semiannually'] })
  frequency: string;

  @Prop({ required: true, min: 1, max: 30 })
  dueDate: number;

  @Prop({ type: [{ type: FeeType }], required: true })
  selectedFeeTypes: FeeType[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Student' }], required: true })
  selectedStudents: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true,type:MongooseSchema.Types.ObjectId,ref:'User',immutable:true })
  createdBy: Date;

  @Prop({ required: true,type:MongooseSchema.Types.ObjectId,ref:'User' })
  updatedBy: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'School', immutable: true })
  schoolId: MongooseSchema.Types.ObjectId;
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure);

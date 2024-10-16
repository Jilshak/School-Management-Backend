import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MCQ, MCQSchema } from '../domains/schema/mcq.schema';
import { McqService } from './mcq.service';
import { McqController } from './mcq.controller';
import { GuardsModule } from 'src/guards/guards.module';
import { Syllabus, SyllabusSchema } from 'src/domains/schema/syllabus.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MCQ.name, schema: MCQSchema },{ name: Syllabus.name, schema: SyllabusSchema },]),
    GuardsModule,
  ],
  controllers: [McqController],
  providers: [McqService],
})
export class MCQModule {}

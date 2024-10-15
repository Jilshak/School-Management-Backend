import { Module } from '@nestjs/common';
import { SyllabusController } from './syllabus.controller';
import { SyllabusService } from './syllabus.service';
import { GuardsModule } from 'src/guards/guards.module';
import { Syllabus, SyllabusSchema } from 'src/domains/schema/syllabus.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Subject, SubjectSchema } from 'src/domains/schema/subject.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Syllabus.name, schema: SyllabusSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
    GuardsModule,
  ],
  controllers: [SyllabusController],
  providers: [SyllabusService],
})
export class SyllabusModule {}

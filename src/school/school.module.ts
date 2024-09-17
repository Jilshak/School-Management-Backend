import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { School, SchoolSchema } from 'src/domains/schema/school.schema';
import { Class, ClassSchema } from 'src/domains/schema/class.schema';
import { Section, SectionSchema } from 'src/domains/schema/section.schema';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema },
      { name: Class.name, schema: ClassSchema },
      { name: Section.name, schema: SectionSchema },
    ]),
    GuardsModule,
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
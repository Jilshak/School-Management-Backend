import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';
import { Holiday, HolidaySchema } from '../domains/schema/holiday.schema';
import { School, SchoolSchema } from '../domains/schema/school.schema';
import { Classroom, ClassroomSchema } from '../domains/schema/classroom.schema';
import { GuardsModule } from 'src/guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Holiday.name, schema: HolidaySchema },
      { name: School.name, schema: SchoolSchema },
      { name: Classroom.name, schema: ClassroomSchema }
    ]),
    GuardsModule
  ],
  controllers: [HolidaysController],
  providers: [HolidaysService],
})
export class HolidaysModule {}

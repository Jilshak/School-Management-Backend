import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimeTable, TimeTableSchema } from '../domains/schema/timetable.schema';
import { RolesGuard } from '../shared/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeTable.name, schema: TimeTableSchema }]),
  ],
  controllers: [TimetableController],
  providers: [TimetableService, RolesGuard],
})
export class TimetableModule {}
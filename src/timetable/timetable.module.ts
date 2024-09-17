import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimeTable, TimeTableSchema } from '../domains/schema/timetable.schema';
import { GuardsModule } from '../guards/guards.module';
import { User, UserSchema } from 'src/domains/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimeTable.name, schema: TimeTableSchema },
      { name: User.name, schema: UserSchema }
    ]),
    GuardsModule,
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
})
export class TimetableModule {}
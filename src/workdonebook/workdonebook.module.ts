import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkDoneBookController } from './workdonebook.controller';
import { WorkDoneBookService } from './workdonebook.service';
import { WorkDoneBook, WorkDoneBookSchema } from 'src/domains/schema/workdonebook.schema';
import { User, UserSchema } from 'src/domains/schema/user.schema';
import { GuardsModule } from 'src/guards/guards.module';
import { ClassDailyRecord, ClassDailyRecordSchema } from 'src/domains/schema/classDailyRecord.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkDoneBook.name, schema: WorkDoneBookSchema },
      { name: User.name, schema: UserSchema },
      { name: ClassDailyRecord.name, schema: ClassDailyRecordSchema }
    ]),
    GuardsModule,
  ],
  controllers: [WorkDoneBookController],
  providers: [WorkDoneBookService],
})
export class WorkDoneBookModule {}

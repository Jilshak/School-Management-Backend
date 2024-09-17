import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OthersController } from './others.controller';
import { OthersService } from './others.service';
import { Notice, NoticeSchema } from '../domains/schema/notice.schema';
import { Event, EventSchema } from '../domains/schema/event.schema';
import { Todo, TodoSchema } from '../domains/schema/todo.schema';
import { Travel, TravelSchema } from '../domains/schema/travel.schema';
import { Mess, MessSchema } from '../domains/schema/mess.schema';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notice.name, schema: NoticeSchema },
      { name: Event.name, schema: EventSchema },
      { name: Todo.name, schema: TodoSchema },
      { name: Travel.name, schema: TravelSchema },
      { name: Mess.name, schema: MessSchema },
    ]),
    GuardsModule,
  ],
  controllers: [OthersController],
  providers: [OthersService],
})
export class OthersModule {}
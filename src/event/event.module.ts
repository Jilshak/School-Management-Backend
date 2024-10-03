import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuardsModule } from 'src/guards/guards.module';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from 'src/domains/schema/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
    ]),
    GuardsModule,
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}

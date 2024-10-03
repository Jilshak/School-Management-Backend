import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from 'src/domains/schema/event.schema';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async createEvent(createEventDto: CreateEventDto, schoolId: Types.ObjectId) {
    try {
      const event = new this.eventModel({ ...createEventDto, schoolId });
      return await event.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAllEvents(schoolId: Types.ObjectId) {

    return await this.eventModel.find({
      schoolId,
    });
  }

  async updateEvent(id: Types.ObjectId,schoolId: Types.ObjectId,updateEventDto: CreateEventDto) {
    return await this.eventModel.updateOne({_id:id,schoolId}, {$set:updateEventDto});
  }

  async deleteEvent(id: Types.ObjectId,schoolId: Types.ObjectId) {
    return await this.eventModel.deleteOne({_id:id,schoolId});
  }
}

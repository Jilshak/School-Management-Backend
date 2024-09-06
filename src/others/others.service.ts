import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Notice, NoticeDocument } from '../domains/schema/notice.schema';
import { Event, EventDocument } from '../domains/schema/event.schema';
import { Todo, TodoDocument } from '../domains/schema/todo.schema';
import { Travel, TravelDocument } from '../domains/schema/travel.schema';
import { Mess, MessDocument } from '../domains/schema/mess.schema';

@Injectable()
export class OthersService {
  constructor(
    @InjectModel(Notice.name) private noticeModel: Model<NoticeDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    @InjectModel(Travel.name) private travelModel: Model<TravelDocument>,
    @InjectModel(Mess.name) private messModel: Model<MessDocument>,
    @InjectConnection() private connection: Connection
  ) {}

  // Notice Board
  async createNotice(createNoticeDto: any): Promise<Notice> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdNotice = new this.noticeModel(createNoticeDto);
      const result = await createdNotice.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create notice');
    } finally {
      session.endSession();
    }
  }

  async findAllNotices(): Promise<Notice[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const notices = await this.noticeModel.find().session(session).exec();
      await session.commitTransaction();
      return notices;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch notices');
    } finally {
      session.endSession();
    }
  }

  async findOneNotice(id: string): Promise<Notice> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const notice = await this.noticeModel.findById(id).session(session).exec();
      if (!notice) {
        throw new NotFoundException(`Notice with ID ${id} not found`);
      }
      await session.commitTransaction();
      return notice;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch notice');
    } finally {
      session.endSession();
    }
  }

  async updateNotice(id: string, updateNoticeDto: any): Promise<Notice> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedNotice = await this.noticeModel.findByIdAndUpdate(id, updateNoticeDto, { new: true, session }).exec();
      if (!updatedNotice) {
        throw new NotFoundException(`Notice with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedNotice;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update notice');
    } finally {
      session.endSession();
    }
  }

  async removeNotice(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.noticeModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Notice with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove notice');
    } finally {
      session.endSession();
    }
  }

  // Event Calendar
  async createEvent(createEventDto: any): Promise<Event> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdEvent = new this.eventModel(createEventDto);
      const result = await createdEvent.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create event');
    } finally {
      session.endSession();
    }
  }

  async findAllEvents(): Promise<Event[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const events = await this.eventModel.find().session(session).exec();
      await session.commitTransaction();
      return events;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch events');
    } finally {
      session.endSession();
    }
  }

  async findOneEvent(id: string): Promise<Event> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const event = await this.eventModel.findById(id).session(session).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      await session.commitTransaction();
      return event;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch event');
    } finally {
      session.endSession();
    }
  }

  async updateEvent(id: string, updateEventDto: any): Promise<Event> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedEvent = await this.eventModel.findByIdAndUpdate(id, updateEventDto, { new: true, session }).exec();
      if (!updatedEvent) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedEvent;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update event');
    } finally {
      session.endSession();
    }
  }

  async removeEvent(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.eventModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove event');
    } finally {
      session.endSession();
    }
  }

  // To-Do List
  async createTodo(createTodoDto: any): Promise<Todo> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdTodo = new this.todoModel(createTodoDto);
      const result = await createdTodo.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create todo');
    } finally {
      session.endSession();
    }
  }

  async findAllTodos(): Promise<Todo[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const todos = await this.todoModel.find().session(session).exec();
      await session.commitTransaction();
      return todos;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch todos');
    } finally {
      session.endSession();
    }
  }

  async findOneTodo(id: string): Promise<Todo> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const todo = await this.todoModel.findById(id).session(session).exec();
      if (!todo) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }
      await session.commitTransaction();
      return todo;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch todo');
    } finally {
      session.endSession();
    }
  }

  async updateTodo(id: string, updateTodoDto: any): Promise<Todo> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedTodo = await this.todoModel.findByIdAndUpdate(id, updateTodoDto, { new: true, session }).exec();
      if (!updatedTodo) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedTodo;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update todo');
    } finally {
      session.endSession();
    }
  }

  async removeTodo(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.todoModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove todo');
    } finally {
      session.endSession();
    }
  }

  // Travel
  async createTravel(createTravelDto: any): Promise<Travel> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdTravel = new this.travelModel(createTravelDto);
      const result = await createdTravel.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create travel');
    } finally {
      session.endSession();
    }
  }

  async getAllTravels(): Promise<Travel[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const travels = await this.travelModel.find().session(session).exec();
      await session.commitTransaction();
      return travels;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch travels');
    } finally {
      session.endSession();
    }
  }

  // Mess
  async createMess(createMessDto: any): Promise<Mess> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdMess = new this.messModel(createMessDto);
      const result = await createdMess.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create mess');
    } finally {
      session.endSession();
    }
  }

  async getAllMess(): Promise<Mess[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const mess = await this.messModel.find().session(session).exec();
      await session.commitTransaction();
      return mess;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch mess');
    } finally {
      session.endSession();
    }
  }
}
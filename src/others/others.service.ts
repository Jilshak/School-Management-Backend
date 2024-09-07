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

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  // Notice Board
  async createNotice(createNoticeDto: any): Promise<Notice> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdNotice = new this.noticeModel(createNoticeDto);
      const result = await createdNotice.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create notice');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAllNotices(): Promise<Notice[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const notices = await this.noticeModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return notices;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch notices');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOneNotice(id: string): Promise<Notice> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const notice = await this.noticeModel.findById(id).session(session).exec();
      if (!notice) {
        throw new NotFoundException(`Notice with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return notice;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch notice');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateNotice(id: string, updateNoticeDto: any): Promise<Notice> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedNotice = await this.noticeModel.findByIdAndUpdate(id, updateNoticeDto, { new: true, session }).exec();
      if (!updatedNotice) {
        throw new NotFoundException(`Notice with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedNotice;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update notice');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeNotice(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.noticeModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Notice with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove notice');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  // Event Calendar
  async createEvent(createEventDto: any): Promise<Event> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdEvent = new this.eventModel(createEventDto);
      const result = await createdEvent.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create event');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAllEvents(): Promise<Event[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const events = await this.eventModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return events;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch events');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOneEvent(id: string): Promise<Event> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const event = await this.eventModel.findById(id).session(session).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return event;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch event');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateEvent(id: string, updateEventDto: any): Promise<Event> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedEvent = await this.eventModel.findByIdAndUpdate(id, updateEventDto, { new: true, session }).exec();
      if (!updatedEvent) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedEvent;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update event');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeEvent(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.eventModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove event');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  // To-Do List
  async createTodo(createTodoDto: any): Promise<Todo> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdTodo = new this.todoModel(createTodoDto);
      const result = await createdTodo.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create todo');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAllTodos(): Promise<Todo[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const todos = await this.todoModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return todos;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch todos');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOneTodo(id: string): Promise<Todo> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const todo = await this.todoModel.findById(id).session(session).exec();
      if (!todo) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return todo;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch todo');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateTodo(id: string, updateTodoDto: any): Promise<Todo> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedTodo = await this.todoModel.findByIdAndUpdate(id, updateTodoDto, { new: true, session }).exec();
      if (!updatedTodo) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedTodo;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update todo');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeTodo(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.todoModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove todo');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  // Travel
  async createTravel(createTravelDto: any): Promise<Travel> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdTravel = new this.travelModel(createTravelDto);
      const result = await createdTravel.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create travel');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getAllTravels(): Promise<Travel[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const travels = await this.travelModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return travels;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch travels');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  // Mess
  async createMess(createMessDto: any): Promise<Mess> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdMess = new this.messModel(createMessDto);
      const result = await createdMess.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create mess');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getAllMess(): Promise<Mess[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const mess = await this.messModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return mess;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch mess');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}
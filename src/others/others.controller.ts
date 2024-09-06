import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { OthersService } from './others.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { CreateTravelDto } from './dto/create-travel.dto';
import { CreateMessDto } from './dto/create-mess.dto';
import { Notice } from '../domains/schema/notice.schema';
import { Event } from '../domains/schema/event.schema';
import { Todo } from '../domains/schema/todo.schema';
import { Travel } from '../domains/schema/travel.schema';
import { Mess } from '../domains/schema/mess.schema';

@ApiTags('others')
@ApiBearerAuth()
@Controller('others')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OthersController {
  constructor(private readonly othersService: OthersService) {}

  // Notice Board
  @Post('notice')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new notice' })
  @ApiResponse({ status: 201, description: 'The notice has been successfully created.', type: Notice })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateNoticeDto })
  createNotice(@Body() createNoticeDto: CreateNoticeDto) {
    return this.othersService.createNotice(createNoticeDto);
  }

  @Get('notice')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all notices' })
  @ApiResponse({ status: 200, description: 'Return all notices.', type: [Notice] })
  findAllNotices() {
    return this.othersService.findAllNotices();
  }

  @Get('notice/:id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a notice by id' })
  @ApiResponse({ status: 200, description: 'Return the notice.', type: Notice })
  @ApiResponse({ status: 404, description: 'Notice not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Notice ID' })
  findOneNotice(@Param('id') id: string) {
    return this.othersService.findOneNotice(id);
  }

  @Put('notice/:id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a notice' })
  @ApiResponse({ status: 200, description: 'The notice has been successfully updated.', type: Notice })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Notice not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Notice ID' })
  @ApiBody({ type: UpdateNoticeDto })
  updateNotice(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.othersService.updateNotice(id, updateNoticeDto);
  }

  @Delete('notice/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a notice' })
  @ApiResponse({ status: 200, description: 'The notice has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Notice not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Notice ID' })
  removeNotice(@Param('id') id: string) {
    return this.othersService.removeNotice(id);
  }

  // Event Calendar
  @Post('event')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'The event has been successfully created.', type: Event })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateEventDto })
  createEvent(@Body() createEventDto: CreateEventDto) {
    return this.othersService.createEvent(createEventDto);
  }

  @Get('event')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({ status: 200, description: 'Return all events.', type: [Event] })
  findAllEvents() {
    return this.othersService.findAllEvents();
  }

  @Get('event/:id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get an event by id' })
  @ApiResponse({ status: 200, description: 'Return the event.', type: Event })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Event ID' })
  findOneEvent(@Param('id') id: string) {
    return this.othersService.findOneEvent(id);
  }

  @Put('event/:id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'The event has been successfully updated.', type: Event })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Event ID' })
  @ApiBody({ type: UpdateEventDto })
  updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.othersService.updateEvent(id, updateEventDto);
  }

  @Delete('event/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'The event has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Event ID' })
  removeEvent(@Param('id') id: string) {
    return this.othersService.removeEvent(id);
  }

  // To-Do List
  @Post('todo')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'The todo has been successfully created.', type: Todo })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateTodoDto })
  createTodo(@Body() createTodoDto: CreateTodoDto) {
    return this.othersService.createTodo(createTodoDto);
  }

  @Get('todo')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all todos' })
  @ApiResponse({ status: 200, description: 'Return all todos.', type: [Todo] })
  findAllTodos() {
    return this.othersService.findAllTodos();
  }

  @Get('todo/:id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a todo by id' })
  @ApiResponse({ status: 200, description: 'Return the todo.', type: Todo })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Todo ID' })
  findOneTodo(@Param('id') id: string) {
    return this.othersService.findOneTodo(id);
  }

  @Put('todo/:id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiResponse({ status: 200, description: 'The todo has been successfully updated.', type: Todo })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Todo ID' })
  @ApiBody({ type: UpdateTodoDto })
  updateTodo(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.othersService.updateTodo(id, updateTodoDto);
  }

  @Delete('todo/:id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiResponse({ status: 200, description: 'The todo has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Todo ID' })
  removeTodo(@Param('id') id: string) {
    return this.othersService.removeTodo(id);
  }

  // Travel and Mess
  @Post('travel')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Create a new travel record' })
  @ApiResponse({ status: 201, description: 'The travel record has been successfully created.', type: Travel })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateTravelDto })
  createTravel(@Body() createTravelDto: CreateTravelDto) {
    return this.othersService.createTravel(createTravelDto);
  }

  @Get('travel')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Get all travel records' })
  @ApiResponse({ status: 200, description: 'Return all travel records.', type: [Travel] })
  getAllTravels() {
    return this.othersService.getAllTravels();
  }

  @Post('mess')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new mess record' })
  @ApiResponse({ status: 201, description: 'The mess record has been successfully created.', type: Mess })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateMessDto })
  createMess(@Body() createMessDto: CreateMessDto) {
    return this.othersService.createMess(createMessDto);
  }

  @Get('mess')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all mess records' })
  @ApiResponse({ status: 200, description: 'Return all mess records.', type: [Mess] })
  getAllMess() {
    return this.othersService.getAllMess();
  }
}
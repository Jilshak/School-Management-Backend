import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { OthersService } from './others.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('others')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OthersController {
  constructor(private readonly othersService: OthersService) {}

  // Notice Board
  @Post('notice')
  @Roles('admin', 'teacher')
  createNotice(@Body() createNoticeDto: any) {
    return this.othersService.createNotice(createNoticeDto);
  }

  @Get('notice')
  @Roles('admin', 'teacher', 'student')
  findAllNotices() {
    return this.othersService.findAllNotices();
  }

  @Get('notice/:id')
  @Roles('admin', 'teacher', 'student')
  findOneNotice(@Param('id') id: string) {
    return this.othersService.findOneNotice(id);
  }

  @Put('notice/:id')
  @Roles('admin', 'teacher')
  updateNotice(@Param('id') id: string, @Body() updateNoticeDto: any) {
    return this.othersService.updateNotice(id, updateNoticeDto);
  }

  @Delete('notice/:id')
  @Roles('admin')
  removeNotice(@Param('id') id: string) {
    return this.othersService.removeNotice(id);
  }

  // Event Calendar
  @Post('event')
  @Roles('admin', 'teacher')
  createEvent(@Body() createEventDto: any) {
    return this.othersService.createEvent(createEventDto);
  }

  @Get('event')
  @Roles('admin', 'teacher', 'student')
  findAllEvents() {
    return this.othersService.findAllEvents();
  }

  @Get('event/:id')
  @Roles('admin', 'teacher', 'student')
  findOneEvent(@Param('id') id: string) {
    return this.othersService.findOneEvent(id);
  }

  @Put('event/:id')
  @Roles('admin', 'teacher')
  updateEvent(@Param('id') id: string, @Body() updateEventDto: any) {
    return this.othersService.updateEvent(id, updateEventDto);
  }

  @Delete('event/:id')
  @Roles('admin')
  removeEvent(@Param('id') id: string) {
    return this.othersService.removeEvent(id);
  }

  // To-Do List
  @Post('todo')
  @Roles('admin', 'teacher', 'student')
  createTodo(@Body() createTodoDto: any) {
    return this.othersService.createTodo(createTodoDto);
  }

  @Get('todo')
  @Roles('admin', 'teacher', 'student')
  findAllTodos() {
    return this.othersService.findAllTodos();
  }

  @Get('todo/:id')
  @Roles('admin', 'teacher', 'student')
  findOneTodo(@Param('id') id: string) {
    return this.othersService.findOneTodo(id);
  }

  @Put('todo/:id')
  @Roles('admin', 'teacher', 'student')
  updateTodo(@Param('id') id: string, @Body() updateTodoDto: any) {
    return this.othersService.updateTodo(id, updateTodoDto);
  }

  @Delete('todo/:id')
  @Roles('admin', 'teacher', 'student')
  removeTodo(@Param('id') id: string) {
    return this.othersService.removeTodo(id);
  }

  // Travel and Mess
  @Post('travel')
  @Roles('admin', 'teacher', 'student')
  createTravel(@Body() createTravelDto: any) {
    return this.othersService.createTravel(createTravelDto);
  }

  @Get('travel')
  @Roles('admin', 'teacher')
  getAllTravels() {
    return this.othersService.getAllTravels();
  }

  @Post('mess')
  @Roles('admin')
  createMess(@Body() createMessDto: any) {
    return this.othersService.createMess(createMessDto);
  }

  @Get('mess')
  @Roles('admin', 'teacher', 'student')
  getAllMess() {
    return this.othersService.getAllMess();
  }
}
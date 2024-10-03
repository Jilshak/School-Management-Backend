import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { EventService } from './event.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/domains/enums/user-roles.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';


@ApiTags('event')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new event' })
    @ApiBody({ type: CreateEventDto })
    @ApiResponse({ status: 201, description: 'Event created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async createEvent(@Body(ValidationPipe) createEventDto: CreateEventDto,@LoginUser("schoolId") schoolId:Types.ObjectId) {
        return this.eventService.createEvent(createEventDto,schoolId);
    }

    @Get()
    @Roles()
    @ApiOperation({ summary: 'Get all events' })
    @ApiResponse({ status: 200, description: 'Events fetched successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    // @ApiQuery({ name: 'month', required: false, type: Number, description: 'The month to filter events by' })
    async getAllEvents(@LoginUser("schoolId") schoolId:Types.ObjectId) {
        return this.eventService.getAllEvents(schoolId);
    }

    @Patch("/:id")
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update an event' })
    @ApiBody({ type: CreateEventDto })
    @ApiResponse({ status: 200, description: 'Event updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async updateEvent(@Param("id") id:string,@LoginUser("schoolId") schoolId:Types.ObjectId,@Body(ValidationPipe) updateEventDto:CreateEventDto) {
        return this.eventService.updateEvent(new Types.ObjectId(id),schoolId,updateEventDto);
    }

    @Delete("/:id")
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete an event' })
    @ApiResponse({ status: 200, description: 'Event deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async deleteEvent(@Param("id") id:string,@LoginUser("schoolId") schoolId:Types.ObjectId) {
        return this.eventService.deleteEvent(new Types.ObjectId(id),schoolId);
    }
}

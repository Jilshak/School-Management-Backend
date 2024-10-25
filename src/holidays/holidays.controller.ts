import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { Holiday } from '../domains/schema/holiday.schema';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Types } from 'mongoose';

@ApiTags('Holidays')
@ApiBearerAuth()
@Controller('holidays')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new holiday' })
  @ApiResponse({ status: 201, description: 'The holiday has been successfully created.', type: Holiday })
  @ApiBody({ type: CreateHolidayDto })
  create(@Body() createHolidayDto: CreateHolidayDto,@LoginUser('schoolId') schoolId: Types.ObjectId): Promise<Holiday> {
    return this.holidaysService.create(createHolidayDto,schoolId);
  }

  @Get()
  @Roles()
  @ApiOperation({ summary: 'Get all holidays' })
  @ApiResponse({ status: 200, description: 'Return all holidays.', type: [Holiday] })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @LoginUser('schoolId') schoolId?: Types.ObjectId
  ): Promise<any[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.holidaysService.findAll(start, end, schoolId);
  }

  @Patch('exception/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get exception holidays for a school' })
  @ApiResponse({ status: 200, description: 'Edit an array of exception holidays for classes'})
  updateExceptionHolidays(@LoginUser('schoolId') schoolId: Types.ObjectId,@Param('id') id: string,@Body() exceptionClassrooms: Types.ObjectId[]) {
    return this.holidaysService.updateExceptionHolidays(schoolId,id,exceptionClassrooms);
  }

  @Get('weekly')
  @Roles()
  @ApiOperation({ summary: 'Get weekly holidays for a school' })
  @ApiResponse({ status: 200, description: 'Returns an array of day numbers representing weekly holidays', type: [Number] })
  getWeeklyHolidays(@LoginUser('schoolId') schoolId: string): Promise<number[]> {
    return this.holidaysService.getWeeklyHolidays(schoolId);
  }

  @Patch('weekly')
  @Roles('admin')
  @ApiOperation({ summary: 'Update weekly holidays for a school' })
  @ApiResponse({ status: 200, description: 'Returns the updated array of day numbers representing weekly holidays', type: [Number] })
  @ApiBody({ type: [Number], description: 'Array of day numbers (0-6) representing weekly holidays' })
  updateWeeklyHolidays(
    @LoginUser('schoolId') schoolId: string,
    @Body() weeklyHolidays: number[]
  ): Promise<number[]> {
    return this.holidaysService.updateWeeklyHolidays(schoolId, weeklyHolidays);
  }

  @Get(':id')
  @Roles()
  @ApiOperation({ summary: 'Get a holiday by id' })
  @ApiResponse({ status: 200, description: 'Return the holiday.', type: Holiday })
  @ApiResponse({ status: 404, description: 'Holiday not found.' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string): Promise<Holiday> {
    return this.holidaysService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a holiday' })
  @ApiResponse({ status: 200, description: 'The holiday has been successfully updated.', type: Holiday })
  @ApiResponse({ status: 404, description: 'Holiday not found.' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateHolidayDto })
  update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto): Promise<Holiday> {
    return this.holidaysService.update(id, updateHolidayDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a holiday' })
  @ApiResponse({ status: 200, description: 'The holiday has been successfully deleted.', type: Holiday })
  @ApiResponse({ status: 404, description: 'Holiday not found.' })
  @ApiParam({ name: 'id', type: 'string' })
  remove(@Param('id') id: string): Promise<Holiday> {
    return this.holidaysService.remove(id);
  }

 
}

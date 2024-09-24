import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateAccountDto, CreatePaymentDueDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Types } from 'mongoose';
import { FeeType } from '../domains/schema/feeType.schema';
import { CreateFeeTypeDto } from './dto/create-fee-type.dto';
import { UpdateFeeTypeDto } from './dto/update-fee-type.dto';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { FeeStructure } from '../domains/schema/fee-structure.schema';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post("send-due")
  @Roles('admin', 'accountant')
  @ApiOperation({ summary:'Create and Send Payment Due'})
  @ApiResponse({ status: 201, description:'The account has been successfully created.'})
  @ApiResponse({ status: 400, description:'Bad Request.'})
  @ApiBody({ type: CreateAccountDto })
  createSendDue(@Body() createPaymentDueDto: CreatePaymentDueDto,@LoginUser("schoolId") schoolId:Types.ObjectId,@LoginUser("userId") userId:Types.ObjectId) {
    return this.accountsService.createSendDue(createPaymentDueDto,schoolId,userId);
  }

  @Post('fee-types')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Create a new fee type' })
  @ApiResponse({ status: 201, description: 'The fee type has been successfully created.', type: FeeType })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateFeeTypeDto })
  async createFeeType(@Body() createFeeTypeDto: CreateFeeTypeDto,  @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.createFeeType(createFeeTypeDto,schoolId);
  }

  @Get('fee-types')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get all fee types for a school' })
  @ApiResponse({ status: 200, description: 'Returns all fee types.', type: [FeeType] })
  async getFeeTypes( @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.getFeeTypes(schoolId);
  }

  @Get('fee-types/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get a fee type by ID' })
  @ApiResponse({ status: 200, description: 'Returns the fee type.', type: FeeType })
  @ApiResponse({ status: 404, description: 'Fee type not found.' })
  @ApiParam({ name: 'id', type: String })
  async getFeeTypeById(@Param('id') id: string, @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.getFeeTypeById(id, schoolId);
  }

  @Put('fee-types/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Update a fee type' })
  @ApiResponse({ status: 200, description: 'The fee type has been successfully updated.', type: FeeType })
  @ApiResponse({ status: 404, description: 'Fee type not found.' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateFeeTypeDto })
  async updateFeeType(
    @Param('id') id: string,
    @Body() updateFeeTypeDto: UpdateFeeTypeDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId
  ) {
    return this.accountsService.updateFeeType(id, updateFeeTypeDto,schoolId);
  }

  @Delete('fee-types/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Delete a fee type' })
  @ApiResponse({ status: 200, description: 'The fee type has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Fee type not found.' })
  @ApiParam({ name: 'id', type: String })
  async deleteFeeType(@Param('id') id: string, @LoginUser('schoolId') schoolId: Types.ObjectId) {
    await this.accountsService.deleteFeeType(id, new Types.ObjectId(schoolId));
    return { message: 'Fee type deleted successfully' };
  }

  @Post('fee-structures')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Create a new fee structure' })
  @ApiResponse({ status: 201, description: 'The fee structure has been successfully created.', type: FeeStructure })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateFeeStructureDto })
  async createFeeStructure(
    @Body() createFeeStructureDto: CreateFeeStructureDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.createFeeStructure(createFeeStructureDto, schoolId, userId);
  }

  @Get('fee-structures')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get all fee structures for a school' })
  @ApiResponse({ status: 200, description: 'Returns all fee structures.', type: [FeeStructure] })
  async getFeeStructures(@LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.getFeeStructures(schoolId);
  }

  @Get('fee-structures/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get a fee structure by ID' })
  @ApiResponse({ status: 200, description: 'Returns the fee structure.', type: FeeStructure })
  @ApiResponse({ status: 404, description: 'Fee structure not found.' })
  @ApiParam({ name: 'id', type: String })
  async getFeeStructureById(@Param('id') id: string, @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.getFeeStructureById(id, schoolId);
  }

  @Put('fee-structures/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Update a fee structure' })
  @ApiResponse({ status: 200, description: 'The fee structure has been successfully updated.', type: FeeStructure })
  @ApiResponse({ status: 404, description: 'Fee structure not found.' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateFeeStructureDto })
  async updateFeeStructure(
    @Param('id') id: string,
    @Body() updateFeeStructureDto: UpdateFeeStructureDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.updateFeeStructure(id, updateFeeStructureDto, schoolId, userId);
  }

  @Delete('fee-structures/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Delete a fee structure' })
  @ApiResponse({ status: 200, description: 'The fee structure has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Fee structure not found.' })
  @ApiParam({ name: 'id', type: String })
  async deleteFeeStructure(
    @Param('id') id: string, 
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    await this.accountsService.deleteFeeStructure(id, schoolId, userId);
    return { message: 'Fee structure deleted successfully' };
  }
}
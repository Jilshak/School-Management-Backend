import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'The account has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateAccountDto })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'Return all accounts.' })
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get an account by id' })
  @ApiResponse({ status: 200, description: 'Return the account.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Account ID' })
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'The account has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Account ID' })
  @ApiBody({ type: UpdateAccountDto })
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: 200, description: 'The account has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Account ID' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }

  // Add more endpoints for specific account operations as needed
}
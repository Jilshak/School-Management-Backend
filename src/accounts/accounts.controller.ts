import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  // Bill and Receipt
  @Post('bill-receipt')
  @Roles('admin', 'accountant')
  createBillReceipt(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.createBillReceipt(createAccountDto);
  }

  @Get('bill-receipt')
  @Roles('admin', 'accountant')
  findAllBillReceipts() {
    return this.accountsService.findAllBillReceipts();
  }

  @Get('bill-receipt/:id')
  @Roles('admin', 'accountant')
  findOneBillReceipt(@Param('id') id: string) {
    return this.accountsService.findOneBillReceipt(id);
  }

  @Put('bill-receipt/:id')
  @Roles('admin', 'accountant')
  updateBillReceipt(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.updateBillReceipt(id, updateAccountDto);
  }

  @Delete('bill-receipt/:id')
  @Roles('admin')
  removeBillReceipt(@Param('id') id: string) {
    return this.accountsService.removeBillReceipt(id);
  }

  // Fee Structure
  @Post('fee-structure')
  @Roles('admin', 'accountant')
  createFeeStructure(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.createFeeStructure(createAccountDto);
  }

  @Get('fee-structure')
  @Roles('admin', 'accountant')
  findAllFeeStructures() {
    return this.accountsService.findAllFeeStructures();
  }

  @Get('fee-structure/:id')
  @Roles('admin', 'accountant')
  findOneFeeStructure(@Param('id') id: string) {
    return this.accountsService.findOneFeeStructure(id);
  }

  @Put('fee-structure/:id')
  @Roles('admin', 'accountant')
  updateFeeStructure(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.updateFeeStructure(id, updateAccountDto);
  }

  @Delete('fee-structure/:id')
  @Roles('admin')
  removeFeeStructure(@Param('id') id: string) {
    return this.accountsService.removeFeeStructure(id);
  }

  // Student Due Date
  @Post('student-due-date')
  @Roles('admin', 'accountant')
  createStudentDueDate(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.createStudentDueDate(createAccountDto);
  }

  @Get('student-due-date')
  @Roles('admin', 'accountant')
  findAllStudentDueDates() {
    return this.accountsService.findAllStudentDueDates();
  }

  @Get('student-due-date/:id')
  @Roles('admin', 'accountant')
  findOneStudentDueDate(@Param('id') id: string) {
    return this.accountsService.findOneStudentDueDate(id);
  }

  @Put('student-due-date/:id')
  @Roles('admin', 'accountant')
  updateStudentDueDate(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.updateStudentDueDate(id, updateAccountDto);
  }

  @Delete('student-due-date/:id')
  @Roles('admin')
  removeStudentDueDate(@Param('id') id: string) {
    return this.accountsService.removeStudentDueDate(id);
  }

  // Salary Management
  @Post('salary-management')
  @Roles('admin', 'accountant')
  createSalaryManagement(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.createSalaryManagement(createAccountDto);
  }

  @Get('salary-management')
  @Roles('admin', 'accountant')
  findAllSalaryManagements() {
    return this.accountsService.findAllSalaryManagements();
  }

  @Get('salary-management/:id')
  @Roles('admin', 'accountant')
  findOneSalaryManagement(@Param('id') id: string) {
    return this.accountsService.findOneSalaryManagement(id);
  }

  @Put('salary-management/:id')
  @Roles('admin', 'accountant')
  updateSalaryManagement(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.updateSalaryManagement(id, updateAccountDto);
  }

  @Delete('salary-management/:id')
  @Roles('admin')
  removeSalaryManagement(@Param('id') id: string) {
    return this.accountsService.removeSalaryManagement(id);
  }

  @Get('report')
  @Roles('admin', 'accountant')
  getAccountsReport() {
    return this.accountsService.getAccountsReport();
  }

  @Get('statistics')
  @Roles('admin', 'accountant')
  getStatistics() {
    return this.accountsService.getStatistics();
  }
}
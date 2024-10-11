import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query, ValidationPipe, Res, InternalServerErrorException, Patch } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Types } from 'mongoose';
import { FeeType } from '../domains/schema/feeType.schema';
import { CreateFeeTypeDto } from './dto/create-fee-type.dto';
import { UpdateFeeTypeDto } from './dto/update-fee-type.dto';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { FeeStructure } from '../domains/schema/fee-structure.schema';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { CreatePaymentDueDto } from './dto/create-payment-due.dto';
import { UpdatePaymentDueDto } from './dto/update-payment-due.dto';
import { PaymentDue } from 'src/domains/schema/paymentdue.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { CreatePayrollDto } from './dto/create-payroll.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles('admin', 'accountant')
  @ApiOperation({ summary:'Create and Send Payment Due'})
  @ApiResponse({ status: 201, description:'The account has been successfully created.'})
  @ApiResponse({ status: 400, description:'Bad Request.'})
  @ApiBody({ type: CreateAccountDto })
  create(@Body(ValidationPipe) createAccountDto: CreateAccountDto,@LoginUser("schoolId") schoolId:Types.ObjectId,@LoginUser("userId") userId:Types.ObjectId) {
    return this.accountsService.create(createAccountDto,schoolId,userId);
  }

  @Get()
  @Roles('admin', 'accountant')
  @ApiOperation({ summary:'Get all accounts'})
  @ApiResponse({ status: 201, description:'The account has been successfully created.'})
  @ApiResponse({ status: 400, description:'Bad Request.'})
  getAccounts(@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.accountsService.findAll(schoolId);
  }

  @Get("/get-stuedent-accounts-details")
  @Roles('student')
  @ApiOperation({ summary:'Get all accounts'})
  @ApiResponse({ status: 201, description:'The account has been successfully created.'})
  @ApiResponse({ status: 400, description:'Bad Request.'})
 async getAccountsOfStudent(@LoginUser("userId") studentId:Types.ObjectId,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    const accounts = await this.accountsService.findByStudentId(studentId,schoolId);
    const paymentDues =await this.accountsService.getPaymentDueBalanceByStudentId(studentId,schoolId);
    return {accounts,paymentDues};
  }


  @Get("generate-payment-receipt/:id")
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Generate and download payment receipt' })
  @ApiResponse({ status: 201, description: 'The payment receipt has been successfully generated.', type: 'application/octet-stream' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiQuery({ name: 'format', enum: ['html', 'docx'], description: 'File format for the receipt' })
  async generatePaymentReceipt(
    @Param("id") id: string,
    @LoginUser("schoolId") schoolId: Types.ObjectId,
    @Query('format') format: 'html' | 'docx' = 'html',
    @Res() res
  ) {
    try {
      let html:string = await this.accountsService.generatePaymentReciept(id, schoolId);
      let fileContent: string | Buffer = html;
      let contentType: string;
      let fileExtension: string;
    
      switch (format) {
    
        case 'docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          fileExtension = 'docx';
          break;
    
        default:
          contentType = 'text/html';
          fileExtension = 'html';
          break;
      }
    
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=payment-receipt.${fileExtension}`
      });
      res.end(fileContent);
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate payment receipt', error.message);
    }
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

  @Post('payment-dues')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Create a new payment due' })
  @ApiResponse({ status: 201, description: 'The payment due has been successfully created.', type: PaymentDue })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreatePaymentDueDto })
  async createPaymentDue(
    @Body(ValidationPipe) createPaymentDueDto: CreatePaymentDueDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.createPaymentDue(createPaymentDueDto, schoolId, userId);
  }

  @Get('payment-dues')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get all payment dues for a school' })
  @ApiResponse({ status: 200, description: 'Returns all payment dues.', type: [PaymentDue] })
  async getPaymentDues(@LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.getPaymentDues(schoolId);
  }

  @Get('payment-dues/get-by-student/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get a payment due by ID' })
  @ApiResponse({ status: 200, description: 'Returns the payment due.', type: PaymentDue })
  @ApiResponse({ status: 404, description: 'Payment due not found.' })
  @ApiParam({ name: 'id', type: String })
  async getPaymentDueByStudentId(@Param('id') id: string, @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.getPaymentDueByStudentId(id, schoolId);
  }

  @Get('payment-dues/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get a payment due by ID' })
  @ApiResponse({ status: 200, description: 'Returns the payment due.', type: PaymentDue })
  @ApiResponse({ status: 404, description: 'Payment due not found.' })
  @ApiParam({ name: 'id', type: String })
  async getPaymentDueById(@Param('id') id: string, @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.getPaymentDueById(id, schoolId);
  }

  @Get('payment-dues-balance/get-by-student/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get a payment due by ID' })
  @ApiResponse({ status: 200, description: 'Returns the payment due.', type: PaymentDue })
  @ApiResponse({ status: 404, description: 'Payment due not found.' })
  @ApiParam({ name: 'id', type: String })
  async getPaymentDueBalanceByStudentId(@Param('id') id: string, @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.getPaymentDueBalanceByStudentId(id, schoolId);
  }

  @Put('payment-dues/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Update a payment due' })
  @ApiResponse({ status: 200, description: 'The payment due has been successfully updated.', type: PaymentDue })
  @ApiResponse({ status: 404, description: 'Payment due not found.' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePaymentDueDto })
  async updatePaymentDue(
    @Param('id') id: string,
    @Body() updatePaymentDueDto: UpdatePaymentDueDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.updatePaymentDue(id, updatePaymentDueDto, schoolId, userId);
  }

  @Delete('payment-dues/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Delete a payment due' })
  @ApiResponse({ status: 200, description: 'The payment due has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Payment due not found.' })
  @ApiParam({ name: 'id', type: String })
  async deletePaymentDue(
    @Param('id') id: string, 
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    await this.accountsService.deletePaymentDue(id, schoolId, userId);
    return { message: 'Payment due deleted successfully' };
  }

  @Get('expense-categories')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get all expense categories' })
  @ApiResponse({ status: 200, description: 'Returns all expense categories.' })
  getExpenseCategories(@LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.findAllExpenseCategories(schoolId);
  }

  @Get('expenses')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'Returns all expenses.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'fullData', required: false, type: Boolean })
  getExpenses(
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('category') category?: string,
    @Query('fullData') fullData?: boolean,
  ) {
    return this.accountsService.findAllExpenses(schoolId, page, limit, startDate, endDate, category,fullData);
  }

  @Get('ledger')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'Returns all expenses.' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  getLedger(
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.accountsService.findAllLedger(schoolId, startDate, endDate);
  }

  @Get('day-book')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'Returns all expenses.' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  getDayBook(
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.accountsService.findAllDayBook(schoolId, startDate, endDate);
  }

  @Get('user-salary')
  @Roles('admin', 'accountant','hr')
  @ApiOperation({ summary: 'Get all Users with and their salary' })
  @ApiResponse({ status: 200, description: 'Returns all Users with and their salary' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  getUserSalary(
    @LoginUser('schoolId') schoolId: Types.ObjectId,
  ) {
    return this.accountsService.getUserSalary(schoolId);
  }

  @Get(":id")
  @Roles('admin', 'accountant')
  @ApiOperation({ summary:'Get all accounts'})
  @ApiResponse({ status: 201, description:'The account has been successfully created.'})
  @ApiResponse({ status: 400, description:'Bad Request.'})
  getAccountsById(@Param("id") id:string,@LoginUser("schoolId") schoolId:Types.ObjectId) {
    return this.accountsService.findById(id,schoolId);
  } 

  @Put(":id")
  @Roles('admin', 'accountant')
  @ApiOperation({ summary:'Get all accounts'})
  @ApiResponse({ status: 201, description:'The account has been successfully created.'})
  @ApiResponse({ status: 400, description:'Bad Request.'})
  updateAccounts(@Param("id") id:string,@Body(ValidationPipe) updateAccountDto:UpdateAccountDto,@LoginUser("schoolId") schoolId:Types.ObjectId,@LoginUser("userId") userId:Types.ObjectId) {
    return this.accountsService.updateAccount(id,updateAccountDto,schoolId,userId);
  } 

  @Patch("salary-management/:userId")
  @Roles("admin","accountant","hr")
  @ApiOperation({summary:"Create Salary Management"})
  @ApiResponse({status:201,description:"The salary management has been successfully created."})
  @ApiResponse({status:400,description:"Bad Request."})
  @ApiBody({schema:{
    properties:{
      baseSalary: { type: 'number' },
    }
  }})
  async createSalaryManagement(@Param("userId") staffId:string,@Body("baseSalary") baseSalary:number,@LoginUser("schoolId") schoolId:Types.ObjectId,@LoginUser("userId") userId:Types.ObjectId){
    return await this.accountsService.salaryManagement(staffId,baseSalary,schoolId,userId)
  }

  @Post("payrolls")
  @Roles("admin","accountant","hr")
  @ApiOperation({summary:"Create Payroll"})
  @ApiResponse({status:201,description:"The payroll has been successfully created."})
  @ApiResponse({status:400,description:"Bad Request."})
  @ApiBody({type:CreatePayrollDto})
  async createPayroll(@Body(ValidationPipe) createPayrollDto:CreatePayrollDto,@LoginUser("schoolId") schoolId:Types.ObjectId,@LoginUser("userId") userId:Types.ObjectId){
    return await this.accountsService.createPayroll(createPayrollDto,schoolId,userId)
  }

  @Get("payrolls/:userId")
  @Roles("admin","accountant","hr")
  @ApiOperation({summary:"Create Payroll"})
  @ApiResponse({status:201,description:"The payroll has been successfully created."})
  @ApiResponse({status:400,description:"Bad Request."})
  @ApiBody({type:CreatePayrollDto})
  async getUserPayroll(@Param("userId") userId:string,@LoginUser("schoolId") schoolId:Types.ObjectId){
    return await this.accountsService.getPayroll(new Types.ObjectId(userId),schoolId)
  }

  @Post('expenses')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'The expense has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateExpenseDto })
  createExpense(
    @Body(ValidationPipe) createExpenseDto: CreateExpenseDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.createExpense(createExpenseDto, schoolId, userId);
  }



  @Get('expenses/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiResponse({ status: 200, description: 'Returns the expense.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiParam({ name: 'id', type: String })
  getExpenseById(@Param('id') id: string, @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.findExpenseById(id, schoolId);
  }

  @Put('expenses/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, description: 'The expense has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateExpenseDto })
  updateExpense(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExpenseDto: UpdateExpenseDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.updateExpense(id, updateExpenseDto, schoolId, userId);
  }

  @Delete('expenses/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'The expense has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiParam({ name: 'id', type: String })
  deleteExpense(
    @Param('id') id: string,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.deleteExpense(id, schoolId, userId);
  }

  @Post('expense-categories')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Create a new expense category' })
  @ApiResponse({ status: 201, description: 'The expense category has been successfully created.' })
  @ApiBody({ type: CreateExpenseCategoryDto })
  createExpenseCategory(
    @Body(ValidationPipe) createExpenseCategoryDto: CreateExpenseCategoryDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.createExpenseCategory(createExpenseCategoryDto, schoolId, userId);
  }

 

  @Get('expense-categories/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Get an expense category by ID' })
  @ApiResponse({ status: 200, description: 'Returns the expense category.' })
  @ApiResponse({ status: 404, description: 'Expense category not found.' })
  @ApiParam({ name: 'id', type: String })
  getExpenseCategoryById(@Param('id') id: string, @LoginUser('schoolId') schoolId: Types.ObjectId) {
    return this.accountsService.findExpenseCategoryById(id, schoolId);
  }

  @Put('expense-categories/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Update an expense category' })
  @ApiResponse({ status: 200, description: 'The expense category has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Expense category not found.' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateExpenseCategoryDto })
  updateExpenseCategory(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExpenseCategoryDto: UpdateExpenseCategoryDto,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.updateExpenseCategory(id, updateExpenseCategoryDto, schoolId, userId);
  }

  @Delete('expense-categories/:id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Delete an expense category' })
  @ApiResponse({ status: 200, description: 'The expense category has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Expense category not found.' })
  @ApiParam({ name: 'id', type: String })
  deleteExpenseCategory(
    @Param('id') id: string,
    @LoginUser('schoolId') schoolId: Types.ObjectId,
    @LoginUser('userId') userId: Types.ObjectId
  ) {
    return this.accountsService.deleteExpenseCategory(id, schoolId, userId);
  }
}
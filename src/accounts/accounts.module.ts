import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account, AccountSchema } from 'src/domains/schema/account.schema';
import { GuardsModule } from '../guards/guards.module';
import { FeeType, FeeTypeSchema } from 'src/domains/schema/feeType.schema';
import { PaymentDue, PaymentDueSchema } from 'src/domains/schema/paymentdue.schema';
import { FeeStructure, FeeStructureSchema } from 'src/domains/schema/fee-structure.schema';
import { User, UserSchema } from 'src/domains/schema/user.schema';
import { Student, StudentSchema } from 'src/domains/schema/students.schema';
import { School, SchoolSchema } from 'src/domains/schema/school.schema';
import { Expense, ExpenseSchema } from 'src/domains/schema/expense.schema';
import { ExpenseCategory, ExpenseCategorySchema } from '../domains/schema/expense-category.schema';
import { Salary, SalarySchema } from '../domains/schema/salary.schema';
import { Staff, StaffSchema } from 'src/domains/schema/staff.schema';
import { Payroll, PayrollSchema } from 'src/domains/schema/payroll.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: FeeType.name, schema: FeeTypeSchema },
      { name: PaymentDue.name, schema: PaymentDueSchema },
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: ExpenseCategory.name, schema: ExpenseCategorySchema },
      { name: Salary.name, schema: SalarySchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Payroll.name, schema: PayrollSchema }
    ]),
    GuardsModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}

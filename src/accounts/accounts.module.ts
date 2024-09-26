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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: FeeType.name, schema: FeeTypeSchema },
      { name: PaymentDue.name, schema: PaymentDueSchema },
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
    GuardsModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}

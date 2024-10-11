import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeStructure } from '../schema/fee-structure.schema';
import { PaymentDue } from '../schema/paymentdue.schema';
import { NotificationService } from '../../notification/notification.service';
import { User } from '../schema/user.schema';
import { Salary } from '../schema/salary.schema';
import { Payroll } from '../schema/payroll.schema';
import { Staff } from '../schema/staff.schema';

@Injectable()
export class SalaryDueCron {
	private readonly logger = new Logger(SalaryDueCron.name);

	constructor(
		@InjectModel(Salary.name) private salaryModel: Model<Salary>,
		@InjectModel(Payroll.name) private payrollModel: Model<Payroll>,
		@InjectModel(User.name) private userModel: Model<User>,
		@InjectModel(Staff.name) private staffModel: Model<Staff>
	) {}


	@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
	async createPayrolls() {
		this.logger.log('Running create payment dues cron job');

		const users =await this.userModel.find({isActive:true})
        const userIds = users.map(user => user._id)
        const salary = await this.salaryModel.find({userId:{$in:userIds}})
        const payrolls:any[] = []

        users.forEach(user => {
            const userSalary = salary.find(salary => salary.userId === user._id)
            payrolls.push({
                userId: user._id,
                baseSalary: userSalary.baseSalary,
                date: new Date(),
                paid: 0,
                schoolId: user.schoolId,
            })
        })

        const res = await this.payrollModel.insertMany(payrolls)
        console.log(res)
        this.logger.log('Payrolls created successfully');
	}




}
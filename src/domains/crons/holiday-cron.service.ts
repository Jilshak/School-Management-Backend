import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeStructure } from '../schema/fee-structure.schema';
import { PaymentDue } from '../schema/paymentdue.schema';
import { NotificationService } from '../../notification/notification.service';
import { User } from '../schema/user.schema';
import { Holiday } from '../schema/holiday.schema';
import { School } from '../schema/school.schema';

@Injectable()
export class HolidayCron {

	constructor(
		@InjectModel(Holiday.name) private holidayModel: Model<Holiday>,
		@InjectModel(School.name) private schoolModel: Model<School>,
	) {}


	@Cron(CronExpression.EVERY_DAY_AT_4PM)
	async createHolidays(){
		const schools = await this.schoolModel.find().exec()
        const today = new Date().getDay()
        schools.forEach(async (school) => {
			if(school.weeklyHolidays.includes(today)){
				const holiday = new this.holidayModel({
					name: "Weekly Holiday",
					startDate: new Date(),
					endDate: new Date(),
					schoolId: school._id

				})
				await holiday.save()
			}
		})
	}
}
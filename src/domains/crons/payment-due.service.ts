import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeStructure } from '../schema/fee-structure.schema';
import { PaymentDue } from '../schema/paymentdue.schema';
import { NotificationService } from '../../notification/notification.service';
import { User } from '../schema/user.schema';

@Injectable()
export class PaymentDueCron {
	private readonly logger = new Logger(PaymentDueCron.name);

	constructor(
		@InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructure>,
		@InjectModel(PaymentDue.name) private paymentDueModel: Model<PaymentDue>,
		@InjectModel(User.name) private userModel: Model<User>,
		private notificationService: NotificationService,
	) {}


	@Cron(CronExpression.EVERY_DAY_AT_4PM)
	async createPaymentDues() {
		this.logger.log('Running create payment dues cron job');

		const today = new Date();
		const currentDay = today.getDate();
		const currentMonth = today.getMonth();
		const currentYear = today.getFullYear();

		const feeStructuresWithStudents = await this.feeStructureModel.aggregate([
			{
				$match: { dueDate: currentDay }
			},
			{
				$lookup: {
					from: 'students',
					localField: 'selectedStudents',
					foreignField: '_id',
					as: 'students'
				}
			},
			{
				$unwind: '$students'
			},
			{
				$project: {
					_id: 1,
					name: 1,
					frequency: 1,
					dueDate: 1,
					selectedFeeTypes: 1,
					createdBy: 1,
					updatedBy: 1,
					schoolId: 1,
					student: '$students'
				}
			}
		]);

		const createdPaymentDues = [];
		for (const feeStructureWithStudent of feeStructuresWithStudents) {
			const { frequency, student, ...feeStructure } = feeStructureWithStudent;

			if (this.shouldCreatePaymentDue(frequency, currentMonth)) {
				const newPaymentDue = await this.createNewPaymentDue(student, feeStructure, new Date(currentYear, currentMonth, feeStructure.dueDate));
				createdPaymentDues.push(newPaymentDue);
			}
		}

		this.logger.log(`Created ${createdPaymentDues.length} new payment dues`);
		return createdPaymentDues;
	}

	private shouldCreatePaymentDue(frequency: string, currentMonth: number): boolean {
		switch (frequency) {
			case 'monthly':
				return true;
			case 'bimonthly':
				return currentMonth % 2 === 0;
			case 'quarterly':
				return currentMonth % 3 === 0;
			case 'semiannually':
				return currentMonth % 6 === 0;
			default:
				return false;
		}
	}

	private async createNewPaymentDue(student: any, feeStructure: any, dueDate: Date): Promise<PaymentDue> {
		const feeDetails = feeStructure.selectedFeeTypes.map(feeType => ({
			feeType: new Types.ObjectId(feeType._id),
			name: feeType.name,
			amount: feeType.amount,
			count: feeType.count,
			description: feeType.description || '',
			amountDue: feeType.amount * feeType.count,
		}));

		const totalAmountDue = feeDetails.reduce((total, fee) => total + fee.amountDue, 0);

		const newPaymentDue = new this.paymentDueModel({
			userId: student.userId,
			name: feeStructure.name,
			feeDetails,
			dueDate,
			isPaid: false,
			createdBy: new Types.ObjectId(feeStructure.createdBy),
			updatedBy: new Types.ObjectId(feeStructure.updatedBy),
			schoolId: new Types.ObjectId(feeStructure.schoolId),
		});

		const savedPaymentDue = await newPaymentDue.save();

		await this.sendPaymentDueNotification(student, savedPaymentDue, totalAmountDue);

		this.logger.log(`Created new payment due for student ${student.userId} due on ${dueDate}`);

		return savedPaymentDue;
	}

	private async sendPaymentDueNotification(student: any, paymentDue: PaymentDue, totalAmountDue: number) {
		const user = await this.userModel.findById(student.userId);
		if (user && user.fcmToken && user.fcmToken.length > 0) {
			const title = 'Payment Due';
			const body = `You have a new payment due of ${paymentDue.name} for ₹${totalAmountDue} on ${paymentDue.dueDate.toDateString()}`;
			for (const token of user.fcmToken) {
				await this.notificationService.sendNotification(token, title, body);
			}
		}
	}
}
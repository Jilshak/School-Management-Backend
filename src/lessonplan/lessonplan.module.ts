import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonPlanController } from './lessonplan.controller';
import { LessonPlan, LessonPlanSchema } from '../domains/schema/lessonplan.schema';
import { User, UserSchema } from '../domains/schema/user.schema';
import { GuardsModule } from '../guards/guards.module';
import { LessonPlanService } from './lessonplan.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonPlan.name, schema: LessonPlanSchema },
      { name: User.name, schema: UserSchema },
    ]),
    GuardsModule,
  ],
  controllers: [LessonPlanController],
  providers: [LessonPlanService],
})
export class LessonPlanModule {}

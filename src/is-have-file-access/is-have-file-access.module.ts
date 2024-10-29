import { Module } from '@nestjs/common';
import { IsHaveFileAccessService } from './is-have-file-access.service';
import { IsHaveFileAccessController } from './is-have-file-access.controller';
import { User, UserSchema } from 'src/domains/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { GuardsModule } from 'src/guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GuardsModule
  ],
  providers: [IsHaveFileAccessService],
  controllers: [IsHaveFileAccessController]
})
export class IsHaveFileAccessModule {}

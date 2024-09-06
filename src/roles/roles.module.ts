import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role, RoleSchema } from 'src/domains/schema/roles.schema';
import { User, UserSchema } from 'src/domains/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
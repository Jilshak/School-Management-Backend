import { Test, TestingModule } from '@nestjs/testing';
import { IsHaveFileAccessController } from './is-have-file-access.controller';

describe('IsHaveFileAccessController', () => {
  let controller: IsHaveFileAccessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IsHaveFileAccessController],
    }).compile();

    controller = module.get<IsHaveFileAccessController>(IsHaveFileAccessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

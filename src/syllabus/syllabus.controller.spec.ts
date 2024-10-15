import { Test, TestingModule } from '@nestjs/testing';
import { SyllabusController } from './syllabus.controller';

describe('SyllabusController', () => {
  let controller: SyllabusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyllabusController],
    }).compile();

    controller = module.get<SyllabusController>(SyllabusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

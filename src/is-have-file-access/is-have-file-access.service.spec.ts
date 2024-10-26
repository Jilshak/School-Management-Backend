import { Test, TestingModule } from '@nestjs/testing';
import { IsHaveFileAccessService } from './is-have-file-access.service';

describe('IsHaveFileAccessService', () => {
  let service: IsHaveFileAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsHaveFileAccessService],
    }).compile();

    service = module.get<IsHaveFileAccessService>(IsHaveFileAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

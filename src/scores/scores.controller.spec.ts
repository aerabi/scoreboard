import { Test, TestingModule } from '@nestjs/testing';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { Score } from './score.model';

describe('ScoresController', () => {
  let controller: ScoresController;
  let service: ScoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoresController],
      providers: [ScoresService],
    }).compile();

    controller = module.get<ScoresController>(ScoresController);
    service = module.get<ScoresService>(ScoresService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a score', () => {
    const score: Score = { id: 1, email: 'batman@jl.com', score: 100 };
    controller.create(score);
    expect(service.retrieve()).toEqual([score]);
  });
});

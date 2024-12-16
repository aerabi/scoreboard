import { Test, TestingModule } from '@nestjs/testing';
import { ScoresService } from './scores.service';
import { Score } from './score.model';

describe('ScoresService', () => {
  let service: ScoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoresService],
    }).compile();

    service = module.get<ScoresService>(ScoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should store a score', () => {
    const score: Score = { id: 1, email: 'batman@jl.com', score: 100 };
    service.store(score);
    expect(service.retrieve()).toEqual([score]);
  });

  it('should retrieve unique scores by email', () => {
    const email = 'batman@jl.com';
    const score1: Score = { id: 1, email, score: 100 };
    const score2: Score = { id: 2, email, score: 200 };
    service.store(score1);
    service.store(score2);
    expect(service.retrieve()).toEqual([score2]);
  });
});

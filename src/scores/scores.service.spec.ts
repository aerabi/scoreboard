import { Test, TestingModule } from '@nestjs/testing';
import { ScoresService } from './scores.service';
import { Score } from './score.model';
import { ScoresRepository } from './scores.repository';

describe('ScoresService', () => {
  let service: ScoresService;
  let repository: ScoresRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoresService,
        {
          provide: ScoresRepository,
          useValue: {
            store: jest.fn(),
            retrieve: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScoresService>(ScoresService);
    repository = module.get<ScoresRepository>(ScoresRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should store a score', () => {
    const score: Score = { id: 1, email: 'batman@jl.com', score: 100 };
    service.store(score);
    expect(repository.store).toHaveBeenCalledWith(score);
  });

  it('should retrieve unique scores by email', () => {
    const email = 'batman@jl.com';
    const score1: Score = { id: 1, email, score: 100 };
    const score2: Score = { id: 2, email, score: 200 };
    (repository.retrieve as jest.Mock).mockReturnValue([score1, score2]);
    expect(service.retrieve()).toEqual([score2]);
  });
});

import { Injectable, Inject } from '@nestjs/common';
import { ScoresRepository } from './scores.repository';
import { Score } from './score.model';

@Injectable()
export class ScoresService {
  constructor(@Inject(ScoresRepository) private readonly scoresRepository: ScoresRepository) {}

  store(score: Score): void {
    this.scoresRepository.store(score);
  }

  retrieve(): Score[] {
    const allScores = this.scoresRepository.retrieve();
    const scoresByEmail = allScores.reduce((acc, score) => {
      if (!acc[score.email] || acc[score.email].score < score.score) {
        acc[score.email] = score;
      }
      return acc;
    }, {});
    return Object.values(scoresByEmail);
  }
}

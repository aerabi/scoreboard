import { Injectable } from '@nestjs/common';
import { Score } from './score.model';

@Injectable()
export class ScoresService {
  private scores: Score[] = [];

  store(score: Score) {
    this.scores.push(score);
  }

  retrieve() {
    const scoresByEmail = this.scores.reduce((acc, score) => {
      if (!acc[score.email] || acc[score.email].score < score.score) {
        acc[score.email] = score;
      }
      return acc;
    }, {});
    return Object.values(scoresByEmail);
  }
}

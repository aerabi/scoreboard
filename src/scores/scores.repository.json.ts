import { Injectable } from '@nestjs/common';

import { ScoresRepository } from './scores.repository';
import { Score } from './score.model';
import * as fs from 'fs';

const SCORES_FILENAME = 'scores.json';

@Injectable()
export class ScoresJsonRepository implements ScoresRepository {
  private scores: Score[] = [];
  private readonly filename: string;

  constructor() {
    const filenameFromEnv = process.env.SCORES_FILENAME;
    if (filenameFromEnv) {
      this.filename = filenameFromEnv;
    } else {
      this.filename = SCORES_FILENAME;
    }

    this.load();
  }

  store(score: Score): void {
    this.scores.push(score);
    this.save();
  }

  retrieve(): Score[] {
    return this.scores;
  }

  private load(): void {
    try {
      this.scores = JSON.parse(fs.readFileSync(this.filename, 'utf8'));
    } catch (e) {
      this.scores = [];
    }
  }

  private save(): void {
    fs.writeFileSync(this.filename, JSON.stringify(this.scores, null, 2));
  }
}

import { Score } from './score.model';

export interface ScoresRepository {
  store(score: Score): void;
  retrieve(): Score[];
}

export const ScoresRepository = Symbol('ScoresRepository');

import { Controller, Get, Post, Body } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { Score } from './score.model';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  create(@Body() score: Score): void {
    this.scoresService.store(score);
  }

  @Get()
  findAll(): Score[] {
    return this.scoresService.retrieve();
  }
}

import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { ScoresJsonRepository } from './scores.repository.json';
import { ScoresRepository } from './scores.repository';

@Module({
  controllers: [ScoresController],
  providers: [
    ScoresService,
    { provide: ScoresRepository, useClass: ScoresJsonRepository },
  ],
})
export class ScoresModule {}

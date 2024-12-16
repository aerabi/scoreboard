# How to Create a Scoreboard with Node.js and TypeScript

This article is on how to create a scoreboard with Node.js and TypeScript. We will use the NestJS framework to create a simple API that will allow us to create, read, update, and delete scores.

## Technical Requirements

To follow along with this tutorial, you will need to have the following installed on your machine:

- Git
- Node.js
- NPM: Node Package Manager
- Docker

## Setting up the Project

First, let's create a new directory:

```bash
mkdir scoreboard
cd scoreboard
```

Now, let's install NestJS globally:

```bash
npm install -g @nestjs/cli
```

Next, let's create a new NestJS project:

```bash
nest new --directory . scoreboard
```

Now, let's install the necessary dependencies:

```bash
npm install
```

With the current setup, we can run the template project:

```bash
npm run start
```

You can see the project running by visiting `http://localhost:3000` in your browser, or using cURL:

```bash
curl http://localhost:3000
```

It should say "Hello World!".

Let's commit the changes:

```bash
git add .
git commit -m "Add NestJS project"
```

## Creating the Scores Module

Now, we want a module to deal with the scores. Let's create a new module:

```bash
nest generate module scores
```

Then, let's create a controller and a service for the scores:

```bash
nest generate controller scores
nest generate service scores
```

You'll see a new directory structure created in the project:

```
src/scores
├── scores.controller.spec.ts
├── scores.controller.ts
├── scores.module.ts
├── scores.service.spec.ts
└── scores.service.ts
```

And the `ScoresModule` is added to the `src/app.module.ts` file. Let's commit the changes:

```bash
git add src/app.module.ts src/scores
git commit -m "Add scores module"
```

## Create a Model for Scores

Let's create a model for the scores. Create a file `src/scores/score.model.ts`:

```typescript
export interface Score {
  id: number;
  name?: string;
  email: string;
  score: number;
}
```

Now, we want to be able to store and retrieve scores:

- Store: Store a score object
- Retrieve: Retrieve all scores, grouped by email (so we can see the highest score for each email)

Let's implement skeleton methods for these in the `ScoresService`, so that we can write tests for them:

```typescript
import { Injectable } from '@nestjs/common';
import { Score } from './score.model';

@Injectable()
export class ScoresService {
  private scores: Score[] = [];

  store(score: Score) {
    this.scores.push(score);
  }

  retrieve() {
    return this.scores;
  }
}
```

We'll later push the storage down to a repository. Now, let's run the tests before adding more:

```bash
npm run test
```

Now, let's add more tests in `src/scores/scores.service.spec.ts`:

```typescript
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
```

With the current implementation, the first test passes and the second test fails. Let's run the tests again to make sure they fail:

```bash
npm run test
```

One failing test mean everything is working as expected. Now, let's implement the logic to retrieve unique scores by email:

```typescript
import { Injectable } from '@nestjs/common';
import { Score } from './score.model';

@Injectable()
export class ScoresService {
  private scores: Score[] = [];

  store(score: Score): void {
    this.scores.push(score);
  }

  retrieve(): Score[] {
    const scoresByEmail = this.scores.reduce((acc, score) => {
      if (!acc[score.email] || acc[score.email].score < score.score) {
        acc[score.email] = score;
      }
      return acc;
    }, {});
    return Object.values(scoresByEmail);
  }
}
```

Run the tests again, and everything should pass:

```bash
npm run test
```

So, let's commit:

```bash
git add src/scores
git commit -m "Add score model and service"
```

## Implementing the Controller

Now, let's implement the controller. We want to be able to create a score and retrieve all scores. Let's implement the `ScoresController` in `src/scores/scores.controller.ts`:

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { Score } from './score.model';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  create(@Body() score: Score) {
    this.scoresService.store(score);
  }

  @Get()
  findAll(): Score[] {
    return this.scoresService.retrieve();
  }
}
```

Now, let's add tests for the controller in `src/scores/scores.controller.spec.ts`:

```typescript
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
```

All tests should pass:

```bash
npm run test
```

Now, let's test stuff manually:

```bash
npm run start
```

And in another terminal:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"batman@jl.com","score":100}' http://localhost:3000/scores
curl http://localhost:3000/scores
```

You should see the score you just added. Let's commit:

```bash
git add src/scores
git commit -m "Add scores controller"
```

## Adding Repository

Now, let's add a repository to store the scores. But before doing it, let's take some considerations:

- Clean architecture: We want to separate the business logic from the storage logic. The business logic is in the service, and the storage logic is in the repository.
- Dependency inversion: We want the service to depend on an interface, not on a concrete implementation. This way, we can easily swap the repository implementation if needed.

Let's create a repository interface in `src/scores/scores.repository.ts`:

```typescript
import { Score } from './score.model';

export interface ScoresRepository {
  store(score: Score): void;
  retrieve(): Score[];
}

export const ScoresRepository = Symbol('ScoresRepository');
```

Here we have created an interface and also a symbol to represent the interface. It's because an interface is merely a TypeScript construct, and we need a way to represent it in the dependency injection container.

Now, let's create a repository implementation that stores the scores in a JSON file. Let's call it `src/scores/scores.repository.json.ts`:

```typescript
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
```

Now, let's bind the repository to the interface in the `ScoresModule`:

```typescript
import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { ScoresJsonRepository } from './scores.repository.json';
import { ScoresRepository } from './scores.repository';

@Module({
  controllers: [ScoresController],
  providers: [ScoresService, { provide: ScoresRepository, useClass: ScoresJsonRepository }],
})
export class ScoresModule {}
```

Now, let's run the tests:

```bash
npm run test
```

We haven't added any new tests, so everything should pass. Now, let's use the repository in the service:

```typescript
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
```

Now, let's run the tests:

```bash
npm run test
```

They will fail, because the repository is not available in the tests. Let's fix that by providing a mock repository in the tests, starting with `src/scores/scores.service.spec.ts`:

```typescript
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
```

Let's mock the service in the controller tests as well, in `src/scores/scores.controller.spec.ts`:

```typescript
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
      providers: [
        ScoresService,
        {
          provide: ScoresService,
          useValue: {
            store: jest.fn(),
            retrieve: jest.fn(),
          },
        },
      ],
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
    expect(service.store).toHaveBeenCalledWith(score);
  });

  it('should retrieve all scores', () => {
    const scores: Score[] = [{ id: 1, email: 'batman@jl.com', score: 100 }];
    (service.retrieve as jest.Mock).mockReturnValue(scores);
    expect(controller.findAll()).toEqual(scores);
  });
});
```

Now, let's run the tests:

```bash
npm run test
```

Before going home, let's start the project and test it manually:

```bash
npm run start
```

And in another terminal:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"batman@jl.com","score":100}' http://localhost:3000/scores
curl http://localhost:3000/scores
```

It should create a file `scores.json` with the score you just added. So, let's add it to the `.gitignore`:

```bash
echo "scores.json" >> .gitignore
```

Now, let's commit:

```bash
git add src/scores .gitignore
git commit -m "Add repository"
```

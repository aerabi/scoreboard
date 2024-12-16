# Scoreboard

This project is a simple API to manage scores. It allows you to create and retrieve scores.

## Installation

To install the project, run:

```bash
npm install
```

## Running the Project

To run the project, run:

```bash
npm run start
```

## Usage

To create a score, send a POST request to `/scores` with a JSON body:

```json
{
  "email": "batman@jl.com",
  "score": 100
}
```

To retrieve all scores, send a GET request to `/scores`.

## Development

You can run the project in development mode with:

```bash
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

To run tests, use:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
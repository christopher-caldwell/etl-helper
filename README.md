# ETL Helper

Sequential helper function for performing ETL tasks.

**Docs are WIP**

[![NPM](https://img.shields.io/npm/v/@caldwell619/etl-helper.svg)](https://www.npmjs.com/package/@caldwell619/etl-helper) [![NPM](https://img.shields.io/bundlephobia/min/@caldwell619/etl-helper)](https://www.npmjs.com/package/@caldwell619/etl-helper) [![](https://img.shields.io/github/last-commit/christopher-caldwell/etl-helper)]() [![](https://img.shields.io/npm/types/typescript)]()

## Getting Started

```shell
yarn add @caldwell619/etl-helper
```

## Quick Example

```ts
import { etlHelper, Format, Source } from '@caldwell619/etl-helper'

import { CovidResponse, CovidResponseOutput, validateInput, validateOutput } from './schema'

const urlSource: Source<CovidResponse> = {
  url: 'https://api.covidtracking.com/v1/us/daily.json',
}

const urlProvidedNoTransformer = async () => {
  await etlHelper<CovidResponse, CovidResponseOutput>({
    source: urlSource,
    format: Format.JSON,
    validateInput(input) {
      return test(input)
    },
    validateOutput(output) {
      return test(output)
    },
    async persist(outputs) {
      // write to DB
    },
  })
}
```

## Source

## Format

### JSON

### CSV

### XML

## Validate

## Transform

## Persist

## Custom Logger

If you'd like provide your own logger, just pass it along:

```ts
import { adze } from 'adze'
const myLogger = adze()

etlHelper<CovidResponse>({
  source: urlSource,
  format: Format.JSON,
  persist(outputs){
    //
  }
  logger: myLogger,
})
```

The only requirements are that is has a `debug` method with the same call signature as `console.debug`. This logger will be called whenever there is an error for more insight into why the error came up.

## Shout outs

Special thanks to [Public APIs](https://github.com/public-apis/public-apis#currency-exchange) and for these providers not requiring any auth mechanism to pull their data.

- [The COVID Tracking Project](https://covidtracking.com/data/api) for CSV and JSON APIs
- [Narodowy Bank Polski](http://api.nbp.pl/en.html) for having an XML API

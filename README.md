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

## Validate

## Transform

## Persist

# ETL Helper

Structured helper function for performing ETL tasks with optional and configurable concurrency.

[![NPM](https://img.shields.io/npm/v/@caldwell619/etl-helper.svg)](https://www.npmjs.com/package/@caldwell619/etl-helper) [![NPM](https://img.shields.io/bundlephobia/min/@caldwell619/etl-helper)](https://bundlephobia.com/package/@caldwell619/etl-helper) [![](https://img.shields.io/github/last-commit/christopher-caldwell/etl-helper)](https://github.com/christopher-caldwell/etl-helper) [![](https://img.shields.io/npm/types/typescript)]()

## Getting Started

```shell
yarn add @caldwell619/etl-helper
```

## Quick Example

```ts
import { etlHelper, Format, Source } from '@caldwell619/etl-helper'

// Below, all variables named `input` will be this type, as it's the first argument in the generic
type Input = ...
// Below, all variables named `output` will be this type, as it's the second argument in the generic
type Output = ...

// Providing source, will make a GET request to this endpoint.
// This serves as the extract step.
const urlSource: Source<CovidResponse> = {
  url: 'https://api.covidtracking.com/v1/us/daily.json',
}

const urlProvidedNoTransformer = async () => {
  await etlHelper<Input, Output>({
    source: urlSource,
    format: Format.JSON,
    // Optional function to ensure the data from the extract meets your needs
    validateInput(input) {
      return test(input)
    },
    // Map the incoming data to your needs.
    // If this doesn't meet your needs, return `null` and it will be skipped
    transformer(input, index){
      return {...input, createdAt: new Date()}
    }
    // Optional function to ensure the data coming from `transform` meets your needs.
    validateOutput(output) {
      return test(output)
    },
    // write to DB
    async persist(outputs) {
      //
    },
  })
}
```

## Source

Here you can specify a few different ways to get your data into the pipeline. See [the type](./src/types.ts) for an exact rundown

### Client

If you provide a `client`, the helper will use your Axios client to make the request. This is helpful for attaching authentication mechanisms to your client such as getting an auth token, and having base URLs.

### URL

If you provide URL, the helper will make a GET request to the given URL using your Axios client, or a default one.

If using JSON as a [format](#format), the endpoint must be an array, or route to an array through the use of `accessorKey`.

### Accessor Key

This string is for informing the base client how to access the data you wish to extract.

For example, your endpoint returns:

```json
{
  "results": [...],
  "total": 100
}
```

Your `accessorKey` would be `results`.

This can be extended to any sort of notation such as index positions and object properties.

Given the following response:

```json
{
  "data": {
    "products": [
      {
        "storesSold": [...]
      }
    ]
  }
}
```

To access `storesSold` your `accessorKey` would be `data.products.0.storesSold`.

### Data

Finally, if none of the above works for you, you can just provide the `data`. This can be a few different types based on your format.

## Format

So far, 3 types of data intake are supported. JSON, CSV, and XML. You specify your data type in the options using the provided Enum, `Format`.

```ts
import { Format } from '@caldwell619/etl-helper'

await etlHelper<Input, Output>({
  format: Format.CSV,
  // ...otherOptions
})
```

### JSON

Your standard JSON data. Provided data / endpoint result must be an array.

### CSV

Comma Separated Values. Provided data / endpoint result must be a string of Buffer. You can provide a Buffer via `fs`:

```ts
const csvData = readFileSync(csvPath)
await etlHelper<CovidResponseCsv, CovidResponseOutput>({
  source: {
    data: csvData,
  },
  format: Format.CSV,
  // ...otherOptions
})
```

Or a string from an endpoint, or an URL that will download a CSV.

### XML

Not everyone's favorite form of data, but the endpoints are still out there.

Input must be a string.

```ts
const urlSource: Source<ExchangeRateInput> = {
  url: 'http://api.nbp.pl/api/exchangerates/tables/A',
  accessorKey: 'ArrayOfExchangeRatesTable.ExchangeRatesTable.0.Rates.0.Rate',
  // ...otherOptions
}

await etlHelper<Input, Output>({
  source: urlSource,
  format: Format.XML,
  // ...otherOptions
})
```

## Validate

Your time to validate the input and output against whatever logic you have. In the demos, I have done this with [zod schemas](./demo/src/schema.ts). You are of course free to use whatever, just return `true` or `false`.

This step is _optional_, and will throw and error if you return `false`. If you still need to validate, but don't want to throw an error, you can do so in transform.

### Execution Order

`validateInput` runs before `transformer` and `validateOutput` runs after `transformer`. Both are optional if you prefer to do your validation inside the `transformer` function.

## Transform

Match the intake data to your output desired structure.

See the [demo](./demo/src/json.ts) for a full example.

```ts
await etlHelper<Input, Output>({
  transformer(input, index) {
    if (input.isBad) return null
    return { ...input, createdAt: new Date() }
  },
})
```

If you prefer to validate here, you can do so.

**If your validation fails, and you want to throw this record out, you can return `null`.**

Doing so will remove the record from the records given to the [persist](#persist) function.

## Concurrency

This library has built in concurrency for processing input for the previous 2 steps (`validate` and `transform`). The default is `1`, and will sequentially process the data in the array. If your use case can support it, you can process your records in "parallel".

The following example will process up to 100 records at once.

```ts
await etlHelper<Input, Output>({
  concurrency: 100,
  // ...otherStuff
})
```

## Persist

Final step in the pipeline. The items given to this function have either passed `validateOutput` (if provided), or returned from the `transform` function.

Write your data here and do whatever reporting you need to do if applicable.

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

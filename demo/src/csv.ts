import { etlHelper, Format, Source } from '@caldwell619/etl-helper'
import { parseFloatStrict, durableParseFloat } from '@caldwell619/durable-parse-float'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import { csvInputSchema, CovidResponseOutput, validateOutput } from './schema'

const csvPath = resolve(process.cwd(), 'src', 'daily.csv')
const csvData = readFileSync(csvPath)

type CovidResponseCsv = z.infer<typeof csvInputSchema>

const validateInput = (input: CovidResponseCsv): boolean => {
  const result = csvInputSchema.safeParse(input)
  if (!result.success) {
    console.error(result.error)
    // Do something with the error, reporting, DLQ, or if it meets your special criteria, return `true`
  }
  return result.success
}

const urlSource: Source<CovidResponseCsv> = {
  url: 'https://api.covidtracking.com/v1/us/daily.csv',
}

/**
 * This may or may not be necessary depending on your use case.
 * Some engines convert these strings automatically upon insert.
 * If that's the case, you can just use the same schema and this step is unnecessary
 */
const transformer = (input: CovidResponseCsv): CovidResponseOutput => {
  return {
    hash: input.hash,
    lastModified: input.lastModified,
    date: parseFloatStrict(input.date),
    states: parseFloatStrict(input.states),
    positive: durableParseFloat(input.positive),
    negative: durableParseFloat(input.negative),
    pending: durableParseFloat(input.pending),
    hospitalizedCurrently: durableParseFloat(input.hospitalizedCurrently),
    hospitalizedCumulative: durableParseFloat(input.hospitalizedCumulative),
    inIcuCurrently: durableParseFloat(input.inIcuCurrently),
    inIcuCumulative: durableParseFloat(input.inIcuCumulative),
    onVentilatorCurrently: durableParseFloat(input.onVentilatorCurrently),
    onVentilatorCumulative: durableParseFloat(input.onVentilatorCumulative),
    dateChecked: input.dateChecked,
    death: durableParseFloat(input.death),
    hospitalized: durableParseFloat(input.hospitalized),
    totalTestResults: durableParseFloat(input.totalTestResults),
    recovered: null,
    total: durableParseFloat(input.total),
    posNeg: durableParseFloat(input.posNeg),
    deathIncrease: durableParseFloat(input.deathIncrease),
    hospitalizedIncrease: durableParseFloat(input.hospitalizedIncrease),
    negativeIncrease: durableParseFloat(input.negativeIncrease),
    positiveIncrease: durableParseFloat(input.positiveIncrease),
    totalTestResultsIncrease: durableParseFloat(input.totalTestResultsIncrease),
    ingestionDate: new Date(),
  }
}

const urlProvided = async () => {
  await etlHelper<CovidResponseCsv, CovidResponseOutput>({
    source: urlSource,
    format: Format.CSV,
    validateInput,
    transformer,
    validateOutput,
    persist: async outputs => {
      console.log(outputs.length)
    },
  })
}

const dataProvided = async () => {
  await etlHelper<CovidResponseCsv, CovidResponseOutput>({
    source: {
      data: csvData,
    },
    format: Format.CSV,
    validateInput,
    transformer,
    validateOutput,
    persist: async outputs => {
      console.log(outputs.length)
    },
  })
}

const csv = async () => {
  await urlProvided()
  await dataProvided()
}

csv()

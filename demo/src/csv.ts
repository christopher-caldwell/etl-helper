import { etlHelper, Format, Source } from '@caldwell619/etl-helper'
import { z } from 'zod'
import isInteger from 'is-number'
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

const isIntegerRegex = /^-?[0-9.]+$/

export const durableParseFloat = (integer?: string | null | number): number | null => {
  if (typeof integer === 'number') {
    return isInteger(integer) ? integer : null
  }
  if (typeof integer === 'string') {
    return isIntegerRegex.test(integer) ? parseFloat(integer) : null
  }
  return null
}

export const parseFloatStrict = (integer?: string | null | number): number => {
  const result = durableParseFloat(integer)
  if (result === null) throw new Error(`[parseFloatStrict]: Result, ${result}, cannot be null from ${integer}`)

  return result
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

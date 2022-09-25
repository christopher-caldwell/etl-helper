import { z } from 'zod'
import { etlHelper, Format, Source } from '@caldwell619/etl-helper'
import { parseFloatStrict } from '@caldwell619/durable-parse-float'

import { xmlOutputSchema, xmlInputSchema } from './schema'

type ExchangeRateInput = z.infer<typeof xmlInputSchema>
type ExchangeRateOutput = z.infer<typeof xmlOutputSchema>

const validateInput = (input: ExchangeRateInput): boolean => {
  const result = xmlInputSchema.safeParse(input)
  if (!result.success) {
    console.error(result.error)
    // Do something with the error, reporting, DLQ, or if it meets your special criteria, return `true`
  }
  return result.success
}

const validateOutput = (output: ExchangeRateOutput): boolean => {
  const result = xmlOutputSchema.safeParse(output)
  if (!result.success) {
    console.error(result.error)
    // Do something with the error, reporting, DLQ, or if it meets your special criteria, return `true`
  }
  return result.success
}

const urlSource: Source<ExchangeRateInput> = {
  url: 'http://api.nbp.pl/api/exchangerates/tables/A',
  // XML needs to die in a hole somewhere
  accessorKey: 'ArrayOfExchangeRatesTable.ExchangeRatesTable.0.Rates.0.Rate',
  options: {
    params: {
      format: 'XML',
    },
  },
}

const urlProvidedNoTransformer = async () => {
  await etlHelper<ExchangeRateInput, ExchangeRateOutput>({
    source: urlSource,
    format: Format.XML,
    validateInput,
    transformer(input) {
      return {
        currency: input.Currency[0],
        code: input.Code[0],
        mid: parseFloatStrict(input.Mid[0]),
        ingestionDate: new Date(),
      }
    },
    validateOutput,
    persist: async outputs => {
      console.log(outputs.length)
    },
  })
}

const xml = async () => {
  await urlProvidedNoTransformer()
}

xml()

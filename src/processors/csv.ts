import { parse } from 'csv-parse/sync'

import { LoggerOverride } from '@/index'

export const csvProcessor = <TInput>(data: unknown, logger?: LoggerOverride): TInput => {
  const isDataValidForParsing = typeof data === 'string' || Buffer.isBuffer(data)
  if (!isDataValidForParsing) throw new Error('[csvProcessor]: Provided data is not compatible to be parsed as CSV')
  const result = parse(data, { columns: true }) as TInput
  if (!Array.isArray(result)) {
    logger?.debug('[csvProcessor]: Data provided is not an array', result)
    throw new Error('[csvProcessor]: Data provided is not an array')
  }
  return result
}

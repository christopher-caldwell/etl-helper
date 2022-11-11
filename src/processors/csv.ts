import { LoggerOverride } from '@/index'

export const csvProcessor = async <TInput>(data: unknown, logger?: LoggerOverride): Promise<TInput> => {
  const { parse } = await import('csv-parse/sync')
  const isDataValidForParsing = typeof data === 'string' || Buffer.isBuffer(data)
  if (!isDataValidForParsing) throw new Error('[csvProcessor]: Provided data is not compatible to be parsed as CSV')
  const result = parse(data, { columns: true }) as TInput
  if (!Array.isArray(result)) {
    logger?.debug('[csvProcessor]: Data provided is not an array', result)
    throw new Error('[csvProcessor]: Data provided is not an array')
  }
  return result
}

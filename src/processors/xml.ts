import { LoggerOverride } from '@/index'
import { accessData } from './accessor'

export const xmlProcessor = async <TInput>(
  data: unknown,
  accessorKey?: string,
  logger?: LoggerOverride
): Promise<TInput[]> => {
  const { parseStringPromise } = await import('xml2js')
  if (typeof data !== 'string') {
    logger?.debug('[xmlProcessor]: Provided XML is not a string, and cannot be parsed', data)
    throw new Error('[xmlProcessor]: Provided XML is not a string, and cannot be parsed')
  }
  const result = await parseStringPromise(data)
  const targetedData = accessData(result, accessorKey)
  return targetedData as TInput[]
}

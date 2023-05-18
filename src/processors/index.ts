import { Format, LoggerOverride } from '@/index'

import { csvProcessor } from './csv'
import { jsonProcessor } from './json'
import { xmlProcessor } from './xml'
import { RecursiveKeyedData } from './accessor'

export const formatProcessor = <TInput>(
  format: Format,
  data: RecursiveKeyedData,
  accessorKey?: string,
  logger?: LoggerOverride
): Promise<TInput[]> => {
  switch (format) {
    case Format.XML:
      return xmlProcessor(data, accessorKey, logger)
    case Format.CSV:
      return csvProcessor(data, logger)
    case Format.JSON:
      return jsonProcessor(data, accessorKey, logger)
    default:
      throw new Error(`[formatProcessor]: Unsupported format type: ${format}`)
  }
}

export { csvProcessor } from './csv'
export { jsonProcessor } from './json'
export { xmlProcessor } from './xml'

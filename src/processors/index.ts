import { Format } from '@/index'

import { csvProcessor } from './csv'
import { jsonProcessor } from './json'
import { xmlProcessor } from './xml'
import { RecursiveKeyedData } from './accessor'

export const formatProcessor = <TInput>(
  format: Format,
  data: RecursiveKeyedData,
  accessorKey?: string
): Promise<TInput[]> => {
  switch (format) {
    case Format.XML:
      return xmlProcessor(data, accessorKey)
    case Format.CSV:
      return csvProcessor(data)
    case Format.JSON:
      return jsonProcessor(data, accessorKey)
    default:
      throw new Error(`[formatProcessor]: Unsupported format type: ${format}`)
  }
}

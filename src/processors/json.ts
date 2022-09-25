import { LoggerOverride } from '@/index'
import { accessData, RecursiveKeyedData } from './accessor'

export const jsonProcessor = async <TInput>(
  data: RecursiveKeyedData,
  accessorKey?: string,
  logger?: LoggerOverride
): Promise<TInput[]> => {
  const targetedData = accessData(data, accessorKey)
  if (!Array.isArray(targetedData)) {
    logger?.debug('[jsonProcessor]: Data provided is not an array', targetedData)
    throw new Error('[jsonProcessor]: Data provided is not an array')
  }
  return targetedData as TInput[]
}

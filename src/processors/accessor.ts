import { LoggerOverride } from '@/index'

export type RecursiveKeyedData = {
  [id in string]: unknown | RecursiveKeyedData
}

export const accessData = <TResult>(
  data: RecursiveKeyedData,
  accessorKey?: string,
  logger?: LoggerOverride
): TResult => {
  if (!accessorKey) return data as TResult
  const accessorPaths = accessorKey.split('.')
  let accessibleData = data
  while (accessorPaths.length) {
    const newData = accessibleData[accessorPaths[0]] as RecursiveKeyedData
    if (!newData) {
      logger?.debug('[accessData]: Cannot determine path to requested data', {
        data,
        accessibleData,
        accessorPaths,
        accessorKey,
      })
      throw new Error('[accessData]: Cannot determine path to requested data')
    }
    accessibleData = newData
    accessorPaths.shift()
  }
  return accessibleData as TResult
}

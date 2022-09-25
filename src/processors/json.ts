import { accessData, RecursiveKeyedData } from './accessor'

export const jsonProcessor = async <TInput>(data: RecursiveKeyedData, accessorKey?: string): Promise<TInput[]> => {
  const targetedData = accessData(data, accessorKey)
  if (!Array.isArray(targetedData)) {
    console.debug('jsonProcessor', targetedData)
    throw new Error('[jsonProcessor]: Data provided is not an array')
  }
  return targetedData as TInput[]
}

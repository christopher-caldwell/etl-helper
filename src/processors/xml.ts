import { parseStringPromise } from 'xml2js'

import { accessData } from './accessor'

export const xmlProcessor = async <TInput>(data: unknown, accessorKey?: string): Promise<TInput[]> => {
  if (typeof data !== 'string') {
    console.error('xmlProcessor', data)
    throw new Error('[xmlProcessor]: Provided XML is not a string, and cannot be parsed')
  }
  const result = await parseStringPromise(data)
  console.log({ result })
  const targetedData = accessData(result, accessorKey)
  return targetedData as TInput[]
}

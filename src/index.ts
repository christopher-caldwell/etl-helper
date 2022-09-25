import axios, { AxiosRequestConfig } from 'axios'

import { formatProcessor as formatProcessor } from './processors'

export enum Format {
  CSV = 'csv',
  JSON = 'json',
  XML = 'xml',
}

export interface Source<TInput> {
  /** If provided, will make a GET request to this URL for the `input`.
   *
   * Endpoint must provide an array, or use `accessorKey` to path to an array from within the response
   */
  url?: string
  options?: AxiosRequestConfig
  /**
   * If present, this will be the path to the data you wished parsed.
   *
   * For example, some APIs return `total: 12, data: []`. In this case, the key would be `data`.
   * To use nested keys, chain them with periods. `response.subKey.Other_nested_key`
   */
  accessorKey?: string
  /** If provided, will use this as `input`. For XML, this would be a string, CSV could be a string or Buffer */
  data?: TInput[] | string | Buffer
}
export interface LoggerOverride {
  debug: typeof console.debug
}
export interface EtlHelperArgs<TInput, TOutput> {
  /** URL of the data source. Initially going to make this a URL, could move to source like `fs.open` has `path` */
  source: Source<TInput>
  /** Expected format that the source is in */
  format: Format
  /** Function that will provide the input, allow you to mutate it however you'd like, and then return the desired output.
   *
   * If for whatever reason the record does not conform to your standards, you can remove it by returning `null`
   */
  transformer?: (input: TInput, index: number) => TOutput | Promise<TOutput> | null
  /** Function to ensure the input meets your needs. This allows for interop with various tools like Zod, Joi, io-ts, etc */
  validateInput?: (input: TInput) => boolean
  /** Function to ensure the output meets your needs. This allows for interop with various tools like Zod, Joi, io-ts, etc */
  validateOutput?: (output: TOutput) => boolean
  /** Your means of writing the output to a data store */
  persist: (outputs: TOutput[]) => Promise<void>
  logger?: LoggerOverride
}

export const etlHelper = async <TInput, TOutput = TInput>({
  source: { url, options, accessorKey, data: providedData },
  format,
  validateInput,
  transformer,
  validateOutput,
  persist,
  logger,
}: EtlHelperArgs<TInput, TOutput>) => {
  let data
  if (url) {
    data = (await axios.get(url, options)).data
  } else {
    data = providedData
  }
  const inputs = await formatProcessor<TInput>(format, data, accessorKey, logger)
  // If there is no transformer, inputs will be outputs
  let outputs = [...inputs] as unknown as (TOutput | null)[]
  for (let index = 0; index < inputs.length; index++) {
    const targetInput = inputs[index]
    if (validateInput) {
      const isValid = validateInput(targetInput)
      if (!isValid) {
        logger?.debug(targetInput)
        throw new Error(`[validateInput]: Validation error at position: ${index}`)
      }
    }
    if (transformer) {
      const output = await transformer(targetInput, index)
      outputs[index] = output
    }
    if (validateOutput) {
      const targetOutput = outputs[index]
      // If the output is null, there's no need to validate it
      if (!targetOutput) continue
      const isValid = validateOutput(targetOutput)
      if (!isValid) {
        logger?.debug(targetInput)
        throw new Error(`[validateOutput]: Validation error at position: ${index}`)
      }
    }
  }
  const persistableOutputs = outputs.filter(output => output !== null) as TOutput[]
  await persist(persistableOutputs)
}

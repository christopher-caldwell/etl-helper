import type { AxiosInstance, AxiosRequestConfig } from 'axios'

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
  /** Optionally provide a pre-configured Axios client */
  client?: AxiosInstance
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
  /** Number of transformer tasks to be ran in parallel
   * @default 1
   */
  concurrency?: number
}

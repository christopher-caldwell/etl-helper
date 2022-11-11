import axios from 'axios'

import { formatProcessor as formatProcessor } from './processors'
import { EtlHelperArgs, NonNullable } from './types'
import { TaskQueue } from './queue'

export const etlHelper = async <TInput, TOutput = TInput>({
  source: { url, client, options, accessorKey, data: providedData },
  format,
  validateInput,
  transformer,
  validateOutput,
  persist,
  logger,
  concurrency = 1,
}: EtlHelperArgs<TInput, TOutput>): Promise<string> => {
  const Queue = new TaskQueue(concurrency)
  let data
  if (url) {
    const clientToUse = client || axios
    data = (await clientToUse.get(url, options)).data
  } else {
    data = providedData
  }
  const inputs = await formatProcessor<TInput>(format, data, accessorKey, logger)
  // If there is no transformer, inputs will be outputs
  const outputs = [...inputs] as unknown as (TOutput | null)[]
  for (let index = 0; index < inputs.length; index++) {
    Queue.push(async () => {
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
        if (!targetOutput) return
        const isValid = validateOutput(targetOutput)
        if (!isValid) {
          logger?.debug(targetInput)
          throw new Error(`[validateOutput]: Validation error at position: ${index}`)
        }
      }
    })
  }
  return new Promise(res => {
    Queue.emitter.on('done', async () => {
      const persistableOutputs = outputs.filter(output => output !== null) as NonNullable<TOutput>[]
      await persist(persistableOutputs)
      res('done')
    })
  })
}

export * from './types'

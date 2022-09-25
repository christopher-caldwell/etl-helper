import { z } from 'zod'

export const inputSchema = z.object({
  date: z.number(),
  states: z.number(),
  positive: z.number().nullable(),
  negative: z.number().nullable(),
  pending: z.number().nullable(),
  hospitalizedCurrently: z.number().nullable(),
  hospitalizedCumulative: z.number().nullable(),
  inIcuCurrently: z.number().nullable(),
  inIcuCumulative: z.number().nullable(),
  onVentilatorCurrently: z.number().nullable(),
  onVentilatorCumulative: z.number().nullable(),
  dateChecked: z.string().nullable(),
  death: z.number().nullable(),
  hospitalized: z.number().nullable(),
  totalTestResults: z.number().nullable(),
  lastModified: z.string(),
  recovered: z.null(),
  total: z.number().nullable(),
  posNeg: z.number().nullable(),
  deathIncrease: z.number().nullable(),
  hospitalizedIncrease: z.number().nullable(),
  negativeIncrease: z.number().nullable(),
  positiveIncrease: z.number().nullable(),
  totalTestResultsIncrease: z.number().nullable(),
  hash: z.string(),
})

// Since CSV data is all string based, this schema needs to reflect
export const csvInputSchema = z.object({
  date: z.string(),
  states: z.string(),
  positive: z.string().nullable(),
  negative: z.string().nullable(),
  pending: z.string().nullable(),
  hospitalizedCurrently: z.string().nullable(),
  hospitalizedCumulative: z.string().nullable(),
  inIcuCurrently: z.string().nullable(),
  inIcuCumulative: z.string().nullable(),
  onVentilatorCurrently: z.string().nullable(),
  onVentilatorCumulative: z.string().nullable(),
  dateChecked: z.string().nullable(),
  death: z.string().nullable(),
  hospitalized: z.string().nullable(),
  totalTestResults: z.string().nullable(),
  lastModified: z.string(),
  recovered: z.string().nullable(),
  total: z.string().nullable(),
  posNeg: z.string().nullable(),
  deathIncrease: z.string().nullable(),
  hospitalizedIncrease: z.string().nullable(),
  negativeIncrease: z.string().nullable(),
  positiveIncrease: z.string().nullable(),
  totalTestResultsIncrease: z.string().nullable(),
  hash: z.string(),
})

export const outputSchema = inputSchema.extend({
  ingestionDate: z.date(),
})

export type CovidResponse = z.infer<typeof inputSchema>
export type CovidResponseOutput = z.infer<typeof outputSchema>

export const validateInput = (input: CovidResponse): boolean => {
  const result = inputSchema.safeParse(input)
  if (!result.success) {
    console.error(result.error)
    // Do something with the error, reporting, DLQ, or if it meets your special criteria, return `true`
  }
  return result.success
}

export const validateOutput = (output: CovidResponseOutput): boolean => {
  const result = outputSchema.safeParse(output)
  if (!result.success) {
    console.error(result.error)
    // Do something with the error, reporting, DLQ, or if it meets your special criteria, return `true`
  }
  return result.success
}

export const data: CovidResponse[] = [
  {
    date: 20210307,
    states: 56,
    positive: 28756489,
    negative: 74582825,
    pending: 11808,
    hospitalizedCurrently: 40199,
    hospitalizedCumulative: 776361,
    inIcuCurrently: 8134,
    inIcuCumulative: 45475,
    onVentilatorCurrently: 2802,
    onVentilatorCumulative: 4281,
    dateChecked: '2021-03-07T24:00:00Z',
    death: 515151,
    hospitalized: 776361,
    totalTestResults: 363825123,
    lastModified: '2021-03-07T24:00:00Z',
    recovered: null,
    total: 0,
    posNeg: 0,
    deathIncrease: 842,
    hospitalizedIncrease: 726,
    negativeIncrease: 131835,
    positiveIncrease: 41835,
    totalTestResultsIncrease: 1170059,
    hash: 'a80d0063822e251249fd9a44730c49cb23defd83',
  },
]

export const xmlInputSchema = z.object({
  Currency: z.array(z.string()),
  Code: z.array(z.string()),
  Mid: z.array(z.string()),
})

export const xmlOutputSchema = z.object({
  currency: z.string(),
  code: z.string(),
  mid: z.number(),
  ingestionDate: z.date(),
})

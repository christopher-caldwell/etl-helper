import { etlHelper, Format, Source } from '@caldwell619/etl-helper'

import { CovidResponse, CovidResponseOutput, validateInput, validateOutput, data } from './schema'

const urlSource: Source<CovidResponse> = {
  url: 'https://api.covidtracking.com/v1/us/daily.json',
}

const urlProvidedNoTransformer = async () => {
  await etlHelper<CovidResponse>({
    source: urlSource,
    format: Format.JSON,
    validateInput,
    persist: async outputs => {
      console.log(outputs.length)
    },
  })
}

const urlProvidedWithTransformer = async () => {
  await etlHelper<CovidResponse, CovidResponseOutput>({
    source: urlSource,
    format: Format.JSON,
    validateInput,
    transformer(input) {
      return { ...input, ingestionDate: new Date() }
    },
    validateOutput,
    persist: async outputs => {
      console.log(outputs.length)
    },
  })
}

const dataProvidedNoTransformer = async () => {
  await etlHelper<CovidResponse>({
    source: {
      data,
    },
    format: Format.JSON,
    validateInput,
    persist: async outputs => {
      console.log(outputs.length)
    },
  })
}

const dataProvidedBadDataTransformer = async () => {
  await etlHelper<CovidResponse, null>({
    source: {
      data,
    },
    format: Format.JSON,
    validateInput,
    async transformer() {
      return null
    },
    persist: async outputs => {
      // Will be 0, because the `transformer` returned `null`
      console.log(outputs.length)
    },
  })
}

const json = async () => {
  await urlProvidedNoTransformer()
  await urlProvidedWithTransformer()
  await dataProvidedNoTransformer()
  await dataProvidedBadDataTransformer()
}

json()

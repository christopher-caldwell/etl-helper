import { accessData } from '@/processors/accessor'

describe('Access nested data with string key', () => {
  test('Single key returns proper data', () => {
    const res = accessData({ data: 1 }, 'data')
    expect(res).toBe(1)
  })
  test('2 deep nested key returns proper data', () => {
    const res = accessData({ data: { nestedData: 2 } }, 'data.nestedData')
    expect(res).toBe(2)
  })
  test('3 deep nested key returns proper data', () => {
    const res = accessData({ data: { nestedData: { veryNestedData: 3 } } }, 'data.nestedData.veryNestedData')
    expect(res).toBe(3)
  })
  test('Incorrect path throws error', () => {
    expect(() => accessData({ data: { nestedData: { veryNestedData: 3 } } }, 'wrongPath')).toThrowError()
  })
})

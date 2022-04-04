import * as DeliveryParser from './input-delivery.parser'

describe('delivery input parser', () => {
  it('should parse regular objs', () => {
    const given = {
      Delivery: '123',
    }
    const safeInput = DeliveryParser.parse(given)
    expect(safeInput).toEqual({ ok: true, data: given })
  })
  it('should catch invalid objs', () => {
    const given = {
      Delivery: 123,
    }
    const safeInput = DeliveryParser.parse(given)
    expect(safeInput).toMatchObject({ ok: false })
    expect(safeInput).toMatchObject({
      ok: false,
      error: {
        fieldErrors: {
          Delivery: ['Expected string, received number'],
        },
      },
    })
  })
})

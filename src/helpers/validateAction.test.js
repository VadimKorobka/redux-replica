jest.mock('lodash-es/isPlainObject', () =>
  jest.fn((obj) => {
    if (typeof obj !== 'object') {
      return false
    }

    try {
      JSON.stringify(obj)
    } catch (error) {
      return false
    }

    return true
  }),
)
jest.mock('lodash-es/isString', () => jest.fn((str) => typeof str === 'string'))

const validateAction = require('./validateAction').default
const type = 'ACTION_TYPE'

describe('validateAction()', () => {
  it('requires a type', () => {
    expect(validateAction({ type })).toBe(true)
    expect(validateAction()).toBe(false)
    expect(validateAction({})).toBe(false)
    expect(validateAction({ type: undefined })).toBe(false)
  })

  it('only accepts plain objects', () => {
    const action = () => {}
    action.type = type
    expect(validateAction(action)).toBe(false)
  })

  it('only returns true if type is a string', () => {
    expect(validateAction({ type: true })).toBe(false)
    expect(validateAction({ type: 123 })).toBe(false)
  })

  it('returns false if there are invalid keys', () => {
    expect(validateAction({ type, payload: 'foobar' })).toBe(true)
    expect(validateAction({ type, meta: 'foobar' })).toBe(true)
    expect(validateAction({ type, error: new Error() })).toBe(true)
    expect(validateAction({ type, extra: 'foobar' })).toBe(false)
  })
})

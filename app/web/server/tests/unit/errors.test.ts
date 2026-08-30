import { describe, expect, test } from 'bun:test'
import * as errors from '../../errors'

const classes = Object.entries(errors) as [
  string,
  new () => Error & { name: string },
][]

describe('domain errors', () => {
  test('the barrel exports every error class and nothing else', () => {
    expect(classes.length).toBe(17)
    for (const [, Cls] of classes) {
      expect(typeof Cls).toBe('function')
    }
  })

  test('each one is an Error whose name matches its export', () => {
    for (const [name, Cls] of classes) {
      const instance = new Cls()
      expect(instance).toBeInstanceOf(Error)
      expect(instance.name).toBe(name)
    }
  })

  test('each one is distinguishable by instanceof, which is how controllers map status codes', () => {
    for (const [name, Cls] of classes) {
      const instance = new Cls()
      const others = classes.filter(([other]) => other !== name)
      expect(instance).toBeInstanceOf(Cls)
      for (const [, Other] of others) {
        expect(instance instanceof Other).toBe(false)
      }
    }
  })

  test('none carries a message or a status, so controllers own both', () => {
    for (const [, Cls] of classes) {
      expect(new Cls().message).toBe('')
      expect(new Cls()).not.toHaveProperty('status')
    }
  })
})

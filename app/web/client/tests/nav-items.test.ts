import { describe, expect, test } from 'bun:test'
import { navFor } from '../components/layout/nav-items'

const ADMIN_ONLY = ['/clientes', '/coaches']

describe('navFor', () => {
  test('an admin sees every tab', () => {
    expect(navFor(true).length).toBeGreaterThan(navFor(false).length)
    for (const path of ADMIN_ONLY) {
      expect(navFor(true).map((item) => item.path)).toContain(path)
    }
  })

  test('a coach loses exactly the admin only tabs', () => {
    const coachPaths = navFor(false).map((item) => item.path)
    for (const path of ADMIN_ONLY) {
      expect(coachPaths).not.toContain(path)
    }
    expect(navFor(false).every((item) => !item.adminOnly)).toBe(true)
  })

  test('the two lists differ only by the admin only tabs', () => {
    const adminPaths = navFor(true).map((item) => item.path)
    const coachPaths = navFor(false).map((item) => item.path)
    expect(adminPaths.filter((path) => !coachPaths.includes(path))).toEqual(
      ADMIN_ONLY
    )
  })

  test('every tab has a label and a path, and paths are unique', () => {
    const items = navFor(true)
    for (const item of items) {
      expect(item.label).toBeTruthy()
      expect(item.path.startsWith('/')).toBe(true)
    }
    expect(new Set(items.map((item) => item.path)).size).toBe(items.length)
  })

  test('the dashboard is reachable by both roles', () => {
    expect(navFor(false).map((item) => item.path)).toContain('/')
    expect(navFor(true).map((item) => item.path)).toContain('/')
  })
})

import { describe, expect, it } from 'vitest'
import { moderationStatusFor, updateModerationRecord, type DemoRole } from './demoModeration'

describe('demo moderation', () => {
  it('requires the moderator demo role and replaces a product decision', () => {
    const records = updateModerationRecord([], 12, 'approved', 'moderator', '2026-11-08T17:00:00.000Z')
    const updated = updateModerationRecord(records, 12, 'rejected', 'moderator', '2026-11-08T17:01:00.000Z')
    expect(moderationStatusFor(updated, 12)).toBe('rejected')
    expect(updated).toHaveLength(1)
  })

  it.each<DemoRole>(['viewer', 'seller'])('rejects moderation changes for %s', (role) => {
    expect(() => updateModerationRecord([], 12, 'approved', role, '2026-11-08T17:00:00.000Z')).toThrow(/moderator/)
  })
})

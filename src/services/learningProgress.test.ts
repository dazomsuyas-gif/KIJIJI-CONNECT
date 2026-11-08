import { describe, expect, it } from 'vitest'
import { calculateCurrentStreak, localDayKey, recordPracticeDay } from './learningProgress'

describe('learning progress', () => {
  it('records each practice day once', () => {
    const date = new Date(2026, 10, 8)
    expect(recordPracticeDay(['2026-11-07', '2026-11-08'], date)).toEqual(['2026-11-07', '2026-11-08'])
    expect(localDayKey(date)).toBe('2026-11-08')
  })

  it('calculates only the consecutive current streak', () => {
    expect(calculateCurrentStreak(['2026-11-06', '2026-11-07', '2026-11-08', '2026-11-01'], new Date(2026, 10, 8))).toBe(3)
    expect(calculateCurrentStreak(['2026-11-06', '2026-11-07'], new Date(2026, 10, 8))).toBe(0)
  })
})

import { describe, expect, it } from 'vitest'
import { addHabitCheckIn, getCurrentStreak, getLocalDateKey } from './habitChallenge'

describe('habit challenge tracking', () => {
  it('formats a local calendar date without converting it to UTC', () => {
    expect(getLocalDateKey(new Date(2026, 10, 9, 23, 30))).toBe('2026-11-09')
  })

  it('counts consecutive completed days from today backwards', () => {
    expect(getCurrentStreak(['2026-11-07', '2026-11-08', '2026-11-09'], '2026-11-09')).toBe(3)
    expect(getCurrentStreak(['2026-11-07', '2026-11-09'], '2026-11-09')).toBe(1)
    expect(getCurrentStreak(['2026-11-07', '2026-11-08'], '2026-11-09')).toBe(2)
  })

  it('adds at most one check-in per day and stops after seven days', () => {
    const challenge = { habit: 'Read one page', startedOn: '2026-11-01', checkIns: [] as string[] }
    const first = addHabitCheckIn(challenge, '2026-11-01')
    expect(addHabitCheckIn(first, '2026-11-01')).toBe(first)

    const complete = Array.from({ length: 7 }, (_, index) => `2026-11-${String(index + 1).padStart(2, '0')}`)
    const finished = { ...challenge, checkIns: complete }
    expect(addHabitCheckIn(finished, '2026-11-08')).toBe(finished)
  })
})

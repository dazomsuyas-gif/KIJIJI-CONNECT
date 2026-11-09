export type HabitChallenge = {
  habit: string
  startedOn: string
  checkIns: string[]
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurrentStreak(checkIns: string[], today = getLocalDateKey()): number {
  const completedDays = new Set(checkIns)
  let streak = 0
  const cursor = new Date(`${today}T12:00:00`)

  if (!completedDays.has(today)) cursor.setDate(cursor.getDate() - 1)

  while (completedDays.has(getLocalDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function addHabitCheckIn(challenge: HabitChallenge, today = getLocalDateKey()): HabitChallenge {
  if (challenge.checkIns.includes(today) || challenge.checkIns.length >= 7) return challenge

  return {
    ...challenge,
    checkIns: [...challenge.checkIns, today].sort(),
  }
}

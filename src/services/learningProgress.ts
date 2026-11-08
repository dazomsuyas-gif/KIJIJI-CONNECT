export function localDayKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function recordPracticeDay(days: string[], date = new Date()): string[] {
  return [...new Set([...days, localDayKey(date)])].sort().slice(-366)
}

export function calculateCurrentStreak(days: string[], today = new Date()): number {
  const knownDays = new Set(days)
  let streak = 0
  const cursor = new Date(today)
  while (knownDays.has(localDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

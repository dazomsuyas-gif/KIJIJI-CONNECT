import type { LearningLevelId } from './languageLearning'

const courseLevels: Array<{ id: LearningLevelId; band: string }> = [
  { id: 'A1', band: 'Level 1 · CEFR A1' },
  { id: 'A2', band: 'Level 2 · CEFR A2' },
  { id: 'B1', band: 'Level 3 · CEFR B1' },
  { id: 'B2', band: 'Level 4 · CEFR B2' },
  { id: 'C1', band: 'Level 5 · CEFR C1' },
  { id: 'C2', band: 'Level 6 · CEFR C2' },
  { id: 'NATIVE', band: 'Level 7 · Native extension' },
]

export const languageCourseSummaries = [
  { id: 'english', name: 'English' },
  { id: 'french', name: 'French' },
  { id: 'swahili', name: 'Kiswahili' },
  { id: 'mandarin', name: 'Mandarin Chinese' },
] as const

export function getNextLearningLevel(courseId: string, completedLessonIds: string[]) {
  const firstIncomplete = courseLevels.find((level) => !completedLessonIds.includes(`${courseId}-${level.id}`))
  return firstIncomplete ?? courseLevels[0]
}

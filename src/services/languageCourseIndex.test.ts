import { describe, expect, it } from 'vitest'
import { getNextLearningLevel, languageCourseSummaries } from './languageCourseIndex'

describe('lightweight language course index', () => {
  it('resolves English and Kiswahili course summaries without lesson payloads', () => {
    expect(languageCourseSummaries.find((course) => course.id === 'english')?.name).toBe('English')
    expect(languageCourseSummaries.find((course) => course.id === 'swahili')?.name).toBe('Kiswahili')
  })

  it('chooses the next incomplete level and wraps to A1 after completion', () => {
    expect(getNextLearningLevel('english', ['english-A1', 'english-A2'])).toEqual({
      id: 'B1',
      band: 'Level 3 · CEFR B1',
    })
    expect(getNextLearningLevel('english', ['english-A1', 'english-A2', 'english-B1', 'english-B2', 'english-C1', 'english-C2', 'english-NATIVE'])).toEqual({
      id: 'A1',
      band: 'Level 1 · CEFR A1',
    })
  })
})

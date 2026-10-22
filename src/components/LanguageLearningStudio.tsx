import { useState, type FormEvent } from 'react'
import {
  createLevelAssessment,
  languageCourses,
  learningLevels,
  type LearningLevelId,
} from '../services/languageLearning'

type LanguageLearningStudioProps = {
  completedLessonIds: string[]
  levelScores: Record<string, number>
  onLessonPassed: (lessonId: string, score: number) => void
  languageId: string
  onLanguageChange: (languageId: string) => void
  levelId: LearningLevelId
  onLevelChange: (levelId: LearningLevelId) => void
  onPlacementSuggestion: (levelId: LearningLevelId) => void
  writingDrafts: Record<string, string>
  onSaveWriting: (lessonId: string, text: string) => void
}

function getLessonId(languageId: string, levelId: LearningLevelId) {
  return `${languageId}-${levelId}`
}

export function LanguageLearningStudio({
  completedLessonIds,
  levelScores,
  onLessonPassed,
  languageId,
  onLanguageChange,
  levelId,
  onLevelChange,
  onPlacementSuggestion,
  writingDrafts,
  onSaveWriting,
}: LanguageLearningStudioProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [quizResult, setQuizResult] = useState('')
  const [listenMessage, setListenMessage] = useState('')
  const [showPlacement, setShowPlacement] = useState(false)
  const [placementAnswers, setPlacementAnswers] = useState([-1, -1, -1])
  const [editingWriting, setEditingWriting] = useState<{ lessonId: string; text: string }>({ lessonId: '', text: '' })
  const [writingResult, setWritingResult] = useState('')

  const course = languageCourses.find((item) => item.id === languageId) ?? languageCourses[0]
  const currentLevel = course.levels.find((item) => item.id === levelId) ?? course.levels[0]
  const lessonId = getLessonId(course.id, currentLevel.id)
  const assessment = createLevelAssessment(currentLevel)
  const savedWriting = writingDrafts[lessonId] ?? ''
  const writingText = editingWriting.lessonId === lessonId ? editingWriting.text : savedWriting
  const hasUnsavedWriting = writingText !== savedWriting
  const completeCount = course.levels.filter((level) =>
    completedLessonIds.includes(getLessonId(course.id, level.id)),
  ).length
  const progressPercent = Math.round((completeCount / course.levels.length) * 100)
  const score = levelScores[lessonId]

  const selectLevel = (newLevel: LearningLevelId) => {
    onLevelChange(newLevel)
    setAnswers({})
    setQuizResult('')
    setListenMessage('')
  }

  const handleListen = () => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setListenMessage('Audio playback is not available in this browser. Use the pronunciation guide below.')
      return
    }

    const utterance = new SpeechSynthesisUtterance(currentLevel.phrase)
    utterance.lang = course.speechLocale
    utterance.onerror = () => setListenMessage('Audio could not be played. Use the pronunciation guide below.')
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setListenMessage(`Playing the ${course.name} example. Speech quality depends on voices installed in your device.`)
  }

  const handleCheckAssessment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (assessment.some((_, index) => answers[index] === undefined)) {
      setQuizResult('Choose an answer for all three questions before checking your score.')
      return
    }

    const correctAnswers = assessment.reduce(
      (total, question, index) => total + (answers[index] === question.answerIndex ? 1 : 0),
      0,
    )
    const resultScore = Math.round((correctAnswers / assessment.length) * 100)
    if (correctAnswers >= 2) {
      onLessonPassed(lessonId, resultScore)
      setQuizResult(`Passed: ${correctAnswers}/3 (${resultScore}%). This practice result is saved in this browser; it is not a certificate or an official CEFR assessment.`)
    } else {
      setQuizResult(`Not passed yet: ${correctAnswers}/3 (${resultScore}%). Revisit the lesson and try the practice check again; you need 2/3 to mark this module complete.`)
    }
  }

  const handlePlacement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (placementAnswers.some((answer) => answer < 0)) return

    const suggestedLevel = learningLevels[
      Math.round(placementAnswers.reduce((total, answer) => total + answer, 0) / placementAnswers.length)
    ].id
    onPlacementSuggestion(suggestedLevel)
    setShowPlacement(false)
  }

  const handleSaveWriting = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!writingText.trim()) {
      setWritingResult('Write an example sentence before saving your practice.')
      return
    }

    onSaveWriting(lessonId, writingText)
    setWritingResult('Your writing practice was saved in this browser.')
  }

  return (
    <div className="learning-studio">
      <div className="learning-intro">
        <div>
          <span className="eyebrow">Structured language pathways</span>
          <h2>Learn step by step, from first words to confident fluency.</h2>
          <p>Each module combines reading, listening, speaking practice, writing and an assessed knowledge check. Your practice history stays in this browser.</p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowPlacement((current) => !current)}
          aria-expanded={showPlacement}
        >
          {showPlacement ? 'Close level check' : 'Find my starting level'}
        </button>
      </div>

      {showPlacement && (
        <form className="placement-panel" onSubmit={handlePlacement}>
          <div>
            <span className="eyebrow">Quick self-assessment · 1 minute</span>
            <h3>Where would you like to begin?</h3>
            <p>Choose the closest description. This recommends a module; it is not an exam, verified proficiency score or certificate.</p>
          </div>
          {[
            'I am starting out or still learning everyday expressions.',
            'I can handle common situations and explain most ideas.',
            'I can communicate confidently on complex or nuanced topics.',
          ].map((prompt, index) => (
            <label key={prompt}>
              <span>{prompt}</span>
              <select
                value={placementAnswers[index]}
                onChange={(event) => setPlacementAnswers((current) =>
                  current.map((answer, position) => position === index ? Number(event.target.value) : answer),
                )}
                required
              >
                <option value={-1} disabled>Choose a starting point</option>
                {learningLevels.map((level, optionIndex) => (
                  <option key={level.id} value={optionIndex}>{level.band}</option>
                ))}
              </select>
            </label>
          ))}
          <button type="submit" className="primary-button" disabled={placementAnswers.some((answer) => answer < 0)}>
            Recommend a starting point
          </button>
        </form>
      )}

      <div className="learning-controls">
        <label>
          <span>Choose a language</span>
          <select value={course.id} onChange={(event) => {
            onLanguageChange(event.target.value)
            onLevelChange('A1')
            setAnswers({})
            setQuizResult('')
          }}>
            {languageCourses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <div className="learning-progress" aria-label={`${completeCount} of ${course.levels.length} modules passed`}>
          <div><strong>{completeCount} / {course.levels.length} modules passed</strong><span>{progressPercent}% pathway progress</span></div>
          <div className="progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
        </div>
      </div>

      <p className="learning-standard-note">
        {course.name} · {course.standard}. A1–C2 follow CEFR learning goals. The final native-extension module is beyond CEFR and is not a proficiency certificate.
      </p>

      <div className="learning-path" aria-label={`${course.name} learning levels`}>
        {course.levels.map((level, index) => {
          const id = getLessonId(course.id, level.id)
          const isComplete = completedLessonIds.includes(id)
          const isSelected = currentLevel.id === level.id
          return (
            <button
              type="button"
              key={level.id}
              className={`learning-level${isSelected ? ' selected' : ''}${isComplete ? ' passed' : ''}`}
              aria-current={isSelected ? 'step' : undefined}
              onClick={() => selectLevel(level.id)}
            >
              <span className="learning-level__number">{isComplete ? '✓' : index + 1}</span>
              <strong>{level.id === 'NATIVE' ? 'Native +' : level.id}</strong>
              <small>{level.name}</small>
              {levelScores[id] !== undefined && <span className="learning-score">{levelScores[id]}% best</span>}
            </button>
          )
        })}
      </div>

      <div className="learning-lesson">
        <div className="learning-lesson__heading">
          <div>
            <span className="eyebrow">{currentLevel.band} · {currentLevel.name}</span>
            <h3>{currentLevel.description}</h3>
            <p>{currentLevel.objective}</p>
          </div>
          <span className={completedLessonIds.includes(lessonId) ? 'learning-status complete' : 'learning-status'}>
            {completedLessonIds.includes(lessonId) ? 'Module passed' : score !== undefined ? `Best score · ${score}%` : 'Ready to practise'}
          </span>
        </div>

        <div className="learning-skills" aria-label="Lesson skills">
          {['Reading', 'Listening', 'Speaking', 'Writing'].map((skill) => <span key={skill}>{skill}</span>)}
        </div>

        <div className="learning-example-grid">
          <article className="learning-example">
            <span className="learning-example__label">Read & listen · {course.name}</span>
            <p className="learning-phrase" lang={course.speechLocale}>{currentLevel.phrase}</p>
            <small>{currentLevel.pronunciation}</small>
            <button type="button" className="secondary-button learning-listen" onClick={handleListen}>
              Listen to pronunciation
            </button>
            {listenMessage && <span className="learning-feedback" role="status">{listenMessage}</span>}
          </article>
          <article className="learning-example learning-example--plain">
            <span className="learning-example__label">Meaning & language focus</span>
            <p>{currentLevel.translation}</p>
            <small><strong>Focus:</strong> {currentLevel.grammar}</small>
            <small><strong>Try it:</strong> {currentLevel.scenario}</small>
          </article>
        </div>

        <form className="learning-writing" onSubmit={handleSaveWriting}>
          <label htmlFor="learning-writing">Writing practice</label>
          <p>Write your own sentence using the phrase or language focus. It stays on this device.</p>
          <textarea
            id="learning-writing"
            rows={3}
            value={writingText}
            onChange={(event) => {
              setEditingWriting({ lessonId, text: event.target.value })
              setWritingResult('')
            }}
            placeholder="Write your example here…"
          />
          <div className="learning-writing__footer">
            <span>{writingText.trim().split(/\s+/).filter(Boolean).length} words · saved only in this browser</span>
            <button type="submit" className="secondary-button" disabled={!writingText.trim() || !hasUnsavedWriting}>Save writing practice</button>
          </div>
          {writingResult && <p role="status" className="learning-feedback">{writingResult}</p>}
        </form>

        <form className="learning-quiz" onSubmit={handleCheckAssessment}>
          <div>
            <span className="eyebrow">Knowledge check · 3 questions</span>
            <h3>Show what you practised</h3>
            <p>Select at least 2 correct answers to pass this module and track your progress. Retakes are allowed.</p>
          </div>
          {assessment.map((question, questionIndex) => (
            <fieldset key={question.prompt} className="learning-question">
              <legend><span>{questionIndex + 1}</span>{question.prompt}</legend>
              {question.options.map((option, optionIndex) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`learning-${lessonId}-${questionIndex}`}
                    checked={answers[questionIndex] === optionIndex}
                    onChange={() => {
                      setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))
                      setQuizResult('')
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
          ))}
          <button type="submit" className="primary-button">Check my answers</button>
          {quizResult && <p className="learning-quiz-result" role="status">{quizResult}</p>}
        </form>
      </div>

      <p className="learning-disclaimer">
        Courses are original practice material informed by CEFR learning objectives, not endorsed, accredited or proficiency-certified by the Council of Europe or a language-testing body. For Mandarin Chinese, CEFR is used as an indicative learning-path framework, not an official HSK equivalency.
      </p>
    </div>
  )
}

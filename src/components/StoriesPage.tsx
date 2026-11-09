import { useState, type FormEvent } from 'react'
import { addHabitCheckIn, getCurrentStreak, getLocalDateKey, type HabitChallenge } from '../services/habitChallenge'
import { getResponsivePhoto } from '../services/imageAssets'

type Story = { id: number; title: string; language: string; author: string; text: string; cover?: string }
const exampleCover = '/images/tanzania-landscape-960.webp'

const habitStories: Story[] = [
  {
    id: -1,
    title: 'The two-minute start',
    language: 'English',
    author: 'Kijiji Connect editorial',
    cover: exampleCover,
    text: 'When a goal feels too large, make the first action tiny: open the notebook, put on walking shoes, or write one sentence. A small start lowers the barrier and gives tomorrow a clear next step.',
  },
  {
    id: -2,
    title: 'Mazoea madogo, safari kubwa',
    language: 'Kiswahili',
    author: 'Kijiji Connect editorial',
    cover: exampleCover,
    text: 'Badala ya kusubiri motisha kubwa, chagua hatua ndogo unayoweza kurudia kila siku. Weka kitabu karibu na kitanda, andika jambo moja la kujifunza, au tembea kwa dakika chache. Kurudia hujenga mwelekeo.',
  },
  {
    id: -3,
    title: 'Design the place, not just the promise',
    language: 'English',
    author: 'Kijiji Connect editorial',
    cover: exampleCover,
    text: 'Your surroundings can make a choice easier. Keep the water bottle visible, prepare tomorrow’s study materials tonight, and move distractions out of reach. Good systems reduce the need for willpower.',
  },
]

export function StoriesPage() {
  const [challenge, setChallenge] = useState<HabitChallenge | null>(() => {
    try {
      const saved = localStorage.getItem('kijiji-connect-habit-challenge')
      return saved ? JSON.parse(saved) as HabitChallenge : null
    } catch {
      return null
    }
  })
  const [habitInput, setHabitInput] = useState('')
  const [challengeMessage, setChallengeMessage] = useState('')
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem('kijiji-connect-stories')
      return saved ? JSON.parse(saved) as Story[] : habitStories
    } catch {
      return []
    }
  })
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('English')
  const [cover, setCover] = useState<string>()
  const save = (next: Story[]) => {
    setStories(next)
    try {
      localStorage.setItem('kijiji-connect-stories', JSON.stringify(next))
    } catch {
      setChallengeMessage('This browser could not save the update. Check available local storage space and try again.')
    }
  }
  const saveChallenge = (next: HabitChallenge) => {
    try {
      localStorage.setItem('kijiji-connect-habit-challenge', JSON.stringify(next))
      setChallenge(next)
      setChallengeMessage('Your challenge progress is saved in this browser.')
    } catch {
      setChallengeMessage('This browser could not save your challenge. Check available local storage space and try again.')
    }
  }
  const startChallenge = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const habit = habitInput.trim()
    if (!habit) return
    saveChallenge({ habit, startedOn: getLocalDateKey(), checkIns: [] })
  }
  const checkInToday = () => {
    if (!challenge) return
    if (challenge.checkIns.includes(getLocalDateKey())) {
      setChallengeMessage('You have already checked in today. Come back tomorrow for the next day.')
      return
    }
    saveChallenge(addHabitCheckIn(challenge))
  }
  return (
    <section className="section-block" data-route-page="stories" aria-labelledby="stories-heading">
      <div className="section-heading"><div><span className="eyebrow">Local editorial preview · moderation required</span><h2 id="stories-heading">Stories from the community</h2></div></div>
      <p className="phase-note">Original learning collection: these articles explain practical habit-building ideas in our own words. They are not excerpts or a replacement for James Clear’s <em>Atomic Habits</em>. New writing is saved in this browser and enters a local moderation queue; it is not publicly published.</p>
      <div className="habit-guide" aria-labelledby="habit-guide-heading">
        <div>
          <span className="eyebrow">Habit-building guide</span>
          <h2 id="habit-guide-heading">Make a better routine easier to repeat.</h2>
        </div>
        <div className="habit-guide-grid">
          <article><span>01</span><h3>Notice the cue</h3><p>Identify the time, place or feeling that usually starts the behavior.</p></article>
          <article><span>02</span><h3>Shape the desire</h3><p>Connect the routine to something meaningful, enjoyable or useful.</p></article>
          <article><span>03</span><h3>Simplify the action</h3><p>Prepare the environment and make the first step small enough to begin.</p></article>
          <article><span>04</span><h3>Mark the win</h3><p>Use a simple check-in, reflection or supportive community reply to reinforce progress.</p></article>
        </div>
      </div>
      <section className="habit-challenge" aria-labelledby="habit-challenge-heading">
        <div className="habit-challenge__heading">
          <div><span className="eyebrow">7-day local challenge</span><h2 id="habit-challenge-heading">Build one small action into your week.</h2></div>
          {challenge && <div className="habit-streak"><strong>{getCurrentStreak(challenge.checkIns)}</strong><span>day streak</span></div>}
        </div>
        {!challenge ? (
          <form className="habit-challenge__start" onSubmit={startChallenge}>
            <label htmlFor="habit-challenge-action">What small action will you practise?</label>
            <div className="habit-challenge__start-row"><input id="habit-challenge-action" value={habitInput} onChange={(event) => setHabitInput(event.target.value)} maxLength={100} required placeholder="For example, read one page after breakfast" /><button className="primary-button" type="submit">Start my 7 days</button></div>
          </form>
        ) : (
          <div className="habit-challenge__active">
            <p className="habit-challenge__habit"><strong>Your action:</strong> {challenge.habit}</p>
            <div className="habit-week" role="list" aria-label="Seven-day challenge progress">
              {Array.from({ length: 7 }, (_, index) => {
                const done = Boolean(challenge.checkIns[index])
                return <div key={index} role="listitem" className={done ? 'habit-week__day is-done' : 'habit-week__day'} aria-label={`Day ${index + 1}${done ? ', complete' : ', not complete'}`}><span>Day {index + 1}</span><strong aria-hidden="true">{done ? '✓' : index + 1}</strong></div>
              })}
            </div>
            <div className="habit-challenge__footer">
              <p>{challenge.checkIns.length} of 7 daily check-ins complete{challenge.checkIns.length === 7 ? ' · challenge complete!' : ''}</p>
              <button className="primary-button" type="button" onClick={checkInToday} disabled={challenge.checkIns.length >= 7 || challenge.checkIns.includes(getLocalDateKey())}>{challenge.checkIns.length >= 7 ? 'Challenge complete' : challenge.checkIns.includes(getLocalDateKey()) ? 'Checked in today' : 'Check in for today'}</button>
            </div>
          </div>
        )}
        {challengeMessage && <p className="habit-challenge__message" role="status">{challengeMessage}</p>}
        <p className="habit-challenge__note">Preview mode: your check-ins are stored only in this browser. This is a personal tracker, not a public leaderboard.</p>
      </section>
      <div className="phase-list">
        <article className="phase-card">
          <h2>Write a story</h2>
          <form onSubmit={(event) => {
            event.preventDefault()
            if (!title.trim() || !text.trim()) return
            save([{ id: Date.now(), title: title.trim(), language, author: 'You · local draft', text: text.trim(), cover }, ...stories])
            setTitle('')
            setText('')
            setCover(undefined)
          }}>
            <label>Title<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="How I started my business" /></label>
            <label>Language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option><option>Kiswahili</option></select></label>
            <label>Cover image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file || file.size > 512 * 1024) return
              const reader = new FileReader()
              reader.onload = () => setCover(typeof reader.result === 'string' ? reader.result : undefined)
              reader.readAsDataURL(file)
            }} /></label>
            {cover && <img className="story-cover-preview" src={cover} alt="Selected story cover preview" />}
            <label>Story text<textarea required rows={7} value={text} onChange={(event) => setText(event.target.value)} placeholder="Share a useful experience for the Kijiji Connect community." /></label>
            <button type="submit" className="primary-button">Save for moderation</button>
          </form>
        </article>
        {stories.length === 0 && <p className="empty-state">No local stories yet. Start with one of the prompts: “My Arusha day trip” or “A phrase I learned today”.</p>}
        {stories.map((story) => <article className="phase-card story-card" key={story.id}>{story.cover && <img {...getResponsivePhoto(story.cover)} alt="" loading="lazy" />}<span className="badge badge--gold">{story.language} · Pending review</span><h2>{story.title}</h2><p>{story.text}</p><small>{story.author} · example draft</small><button type="button" className="remove-listing" onClick={() => save(stories.filter((item) => item.id !== story.id))}>Delete local draft</button></article>)}
      </div>
    </section>
  )
}

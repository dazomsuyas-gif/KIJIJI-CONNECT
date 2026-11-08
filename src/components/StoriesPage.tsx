import { useState } from 'react'

type Story = { id: number; title: string; language: string; author: string; text: string; cover?: string }

export function StoriesPage() {
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('kijiji-connect-stories') ?? '[]') as Story[]
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
    localStorage.setItem('kijiji-connect-stories', JSON.stringify(next))
  }
  return (
    <section className="section-block" data-route-page="stories" aria-labelledby="stories-heading">
      <div className="section-heading"><div><span className="eyebrow">Local editorial preview · moderation required</span><h2 id="stories-heading">Stories from the community</h2></div></div>
      <p className="phase-note">Sample stories are examples, not testimonials. New writing is saved in this browser and enters a local moderation queue; it is not publicly published.</p>
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
        {stories.map((story) => <article className="phase-card story-card" key={story.id}>{story.cover && <img src={story.cover} alt="" loading="lazy" />}<span className="badge badge--gold">{story.language} · Pending review</span><h2>{story.title}</h2><p>{story.text}</p><small>{story.author} · example draft</small><button type="button" className="remove-listing" onClick={() => save(stories.filter((item) => item.id !== story.id))}>Delete local draft</button></article>)}
      </div>
    </section>
  )
}

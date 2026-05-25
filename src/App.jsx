import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import corpus from './data/corpus.json'
import { THEMATIC_JOURNEY, VISUAL_THEMES, CONTENT_CATEGORIES, BIBLE_BOOKS } from './data/journey'

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function getPrinciplesFor(book, chapter) {
  const bookData = corpus.books?.[book] || {}
  const chData = bookData[String(chapter)] || []
  return chData.map(p => ({
    book, chapter,
    title: p.t, verse_ref: p.v, principle: p.p, application: p.a, god_shot: p.g
  }))
}

function getThemeStyle(visualTheme) {
  return VISUAL_THEMES[visualTheme] || VISUAL_THEMES.nature
}

const AGE_TIERS = {
  preschool: { label: 'Little Seeds', ages: '3–5', emoji: '🌱', desc: 'Simple stories & big truths' },
  elementary: { label: 'Growing Roots', ages: '6–8', emoji: '🌿', desc: 'Deeper stories & real questions' },
  upper: { label: 'Strong Branches', ages: '9–12', emoji: '🌳', desc: 'Full exploration & discussion' }
}

const AVATAR_EMOJIS = ['🌱', '🌿', '🌳', '⭐', '🦁', '🐑', '🕊️', '🌈', '🔥', '💎', '🏔️', '🌻']

// ═══════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let result
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
        result = await supabase.auth.signUp({ email, password })
      }
      if (result.error) throw result.error
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">📖</div>
      <h1 className="auth-title">Hallowed Drafts</h1>
      <p className="auth-subtitle">Daily devotions grounded in Scripture</p>
      
      <div className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        
        <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
        
        <div className="auth-divider">or</div>
        
        <button className="btn btn-secondary btn-block" onClick={handleGoogle} disabled={loading}>
          🔑 Continue with Google
        </button>
        
        <div className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// CHILD SETUP MODAL
// ═══════════════════════════════════════

function AddChildModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [tier, setTier] = useState('elementary')
  const [avatar, setAvatar] = useState('🌱')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onAdd({ name: name.trim(), age_tier: tier, avatar_emoji: avatar })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content slide-up" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">👶 Add a Child</h2>
        
        <input
          className="auth-input"
          type="text"
          placeholder="Child's name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        
        <div style={{ marginTop: 16 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Age Group</p>
          <div className="tier-grid">
            {Object.entries(AGE_TIERS).map(([key, t]) => (
              <div
                key={key}
                className={`tier-option ${tier === key ? 'selected' : ''}`}
                onClick={() => setTier(key)}
              >
                <span className="tier-emoji">{t.emoji}</span>
                <div>
                  <div className="tier-name">{t.label} ({t.ages})</div>
                  <div className="tier-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: 16 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Choose an Avatar</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AVATAR_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setAvatar(e)}
                style={{
                  fontSize: 28, padding: 8, border: avatar === e ? '2px solid var(--lb-primary)' : '2px solid transparent',
                  borderRadius: 12, background: avatar === e ? '#F0F7FF' : 'transparent', cursor: 'pointer'
                }}
              >{e}</button>
            ))}
          </div>
        </div>
        
        <button className="btn btn-primary btn-block mt-24" onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? 'Adding...' : 'Add Child'}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// DEVOTION VIEW
// ═══════════════════════════════════════

function DevotionView({ child, journeyDay, onComplete, familyId }) {
  const [devotion, setDevotion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('Opening God\'s Word...')

  const journey = THEMATIC_JOURNEY[journeyDay % THEMATIC_JOURNEY.length]
  const themeStyle = getThemeStyle(journey.visualTheme)

  const loadingMessages = [
    'Opening God\'s Word... 📖',
    'Finding today\'s treasure... 💎',
    'Preparing your adventure... 🗺️',
    'Almost ready! ✨'
  ]

  useEffect(() => {
    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length
      setLoadingMsg(loadingMessages[msgIdx])
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    generateDevotion()
  }, [journeyDay, child?.age_tier])

  const generateDevotion = async () => {
    setLoading(true)
    setDevotion(null)

    // Check cache first
    try {
      const { data: cached } = await supabase
        .from('devotion_cache')
        .select('content')
        .eq('journey_day', journeyDay)
        .eq('age_tier', child.age_tier)
        .maybeSingle()
      
      if (cached?.content) {
        setDevotion(cached.content)
        setLoading(false)
        return
      }
    } catch (e) { /* cache miss, continue */ }

    // Get principles from corpus
    const otPrinciples = getPrinciplesFor(journey.ot.book, journey.ot.ch)
    const ntPrinciples = getPrinciplesFor(journey.nt.book, journey.nt.ch)
    
    const corpusContext = [
      ...otPrinciples.map(p => `[${p.book} ${p.chapter}] ${p.title}: ${p.principle}`),
      ...ntPrinciples.map(p => `[${p.book} ${p.chapter}] ${p.title}: ${p.principle}`)
    ].join('\n')

    const tierDesc = {
      preschool: 'a 3-5 year old (very simple words, short sentences, concrete images, no abstract theology)',
      elementary: 'a 6-8 year old (simple but engaging, some wonder and questions, relatable examples)',
      upper: 'a 9-12 year old (can handle deeper ideas, real-life application, thoughtful questions)'
    }

    const systemPrompt = `You are a warm, engaging children's Bible teacher creating a daily devotion for ${tierDesc[child.age_tier]}.

The devotion theme is "${journey.theme}" pairing ${journey.ot.book} ${journey.ot.ch} with ${journey.nt.book} ${journey.nt.ch}.

CORPUS PRINCIPLES (from the scholar's own study — ground your content in these):
${corpusContext || 'No specific principles found — use the biblical text directly.'}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "story": "A warm, engaging retelling connecting both passages (3-5 paragraphs for upper, 2-3 for elementary, 1-2 for preschool)",
  "scripture": "One key verse quoted from either passage",
  "scripture_ref": "Book Chapter:Verse",
  "big_idea": "One sentence the child can remember all day",
  "think_about": "One age-appropriate discussion question",
  "prayer": "A short prayer the child can pray (2-3 sentences)",
  "memory_verse": "A short, memorable verse from the passage",
  "memory_verse_ref": "Book Chapter:Verse",
  "fun_fact": "One interesting Bible fact related to the passage"
}`

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: 'user', content: `Create today's devotion: "${journey.title}" — ${journey.theme}` }],
          max_tokens: 1500
        })
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      
      let text = data.content?.[0]?.text || ''
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      
      const parsed = JSON.parse(text)
      setDevotion(parsed)

      // Cache it
      try {
        await supabase.from('devotion_cache').upsert({
          journey_day: journeyDay,
          age_tier: child.age_tier,
          content: parsed
        })
      } catch (e) { /* cache write fail is non-critical */ }

    } catch (err) {
      console.error('Generation error:', err)
      // Fallback devotion from corpus
      const fallbackP = otPrinciples[0] || ntPrinciples[0]
      setDevotion({
        story: fallbackP ? fallbackP.principle : 'Today we explore how God shows His love through His Word.',
        scripture: '',
        scripture_ref: `${journey.ot.book} ${journey.ot.ch}`,
        big_idea: fallbackP ? fallbackP.title : journey.theme,
        think_about: 'What does this teach us about God?',
        prayer: 'Dear God, thank You for Your Word. Help me understand and live by it today. Amen.',
        memory_verse: '',
        memory_verse_ref: '',
        fun_fact: `The book of ${journey.ot.book} is part of the ${BIBLE_BOOKS.find(b => b.name === journey.ot.book)?.section || 'Bible'}.`
      })
    }
    
    setLoading(false)
  }

  const handleComplete = async () => {
    setCompleting(true)
    await onComplete(journeyDay, journey)
    setCompleting(false)
  }

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="loading-emoji">{themeStyle.icon}</div>
        <div className="loading-spinner" />
        <div className="loading-text">{loadingMsg}</div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="devotion-hero" style={{ background: themeStyle.gradient }}>
        <div className="devotion-hero-day">Day {journeyDay + 1} · {journey.category}</div>
        <h1 className="devotion-hero-title">{journey.title}</h1>
        <div className="devotion-hero-theme">
          {journey.ot.book} {journey.ot.ch} + {journey.nt.book} {journey.nt.ch}
        </div>
        <div className="devotion-hero-emoji">{themeStyle.icon}</div>
      </div>

      <div className="devotion-body">
        {/* Story */}
        {devotion?.story && (
          <div className="devotion-section">
            <div className="devotion-section-title">📖 Today's Story</div>
            <div className="devotion-text">{devotion.story}</div>
          </div>
        )}

        {/* Key Scripture */}
        {devotion?.scripture && (
          <div className="devotion-section">
            <div className="devotion-scripture">
              {devotion.scripture}
              <cite>— {devotion.scripture_ref}</cite>
            </div>
          </div>
        )}

        {/* Big Idea */}
        {devotion?.big_idea && (
          <div className="devotion-section">
            <div className="devotion-section-title">💡 Big Idea</div>
            <div className="devotion-text" style={{ fontWeight: 600, fontSize: 17, color: 'var(--lb-primary-dark)' }}>
              {devotion.big_idea}
            </div>
          </div>
        )}

        {/* Think About It */}
        {devotion?.think_about && (
          <div className="devotion-section">
            <div className="devotion-section-title">🤔 Think About It</div>
            <div className="devotion-question">{devotion.think_about}</div>
          </div>
        )}

        {/* Prayer */}
        {devotion?.prayer && (
          <div className="devotion-section">
            <div className="devotion-section-title">🙏 Let's Pray</div>
            <div className="devotion-prayer">{devotion.prayer}</div>
          </div>
        )}

        {/* Memory Verse */}
        {devotion?.memory_verse && (
          <div className="devotion-section">
            <div className="memory-verse-card">
              <div className="memory-verse-label">✨ Memory Verse</div>
              <div className="memory-verse-text">{devotion.memory_verse}</div>
              <div className="memory-verse-ref">— {devotion.memory_verse_ref}</div>
            </div>
          </div>
        )}

        {/* Fun Fact */}
        {devotion?.fun_fact && (
          <div className="devotion-section">
            <div className="devotion-section-title">🌟 Did You Know?</div>
            <div className="devotion-text">{devotion.fun_fact}</div>
          </div>
        )}

        {/* Complete Button */}
        <button
          className="btn btn-accent btn-block devotion-complete-btn"
          onClick={handleComplete}
          disabled={completing}
        >
          {completing ? 'Saving...' : '✅ I Finished Today\'s Devotion!'}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// EXPLORE VIEW
// ═══════════════════════════════════════

function ExploreView({ child }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categoryEmojis = {
    'Creation & Identity': '🌍',
    'Courage & Faith': '🛡️',
    'Love & Kindness': '❤️',
    'Wisdom & Truth': '📚',
    'Prayer & Worship': '🙏',
    'Forgiveness & Grace': '🕊️',
    'God\'s Promises': '🌈',
    'Serving Others': '🤲',
    'Standing Firm': '⚔️',
    'Joy & Praise': '🎉'
  }

  const categoryCounts = {}
  THEMATIC_JOURNEY.forEach(j => {
    categoryCounts[j.category] = (categoryCounts[j.category] || 0) + 1
  })

  if (selectedCategory) {
    const entries = THEMATIC_JOURNEY.filter(j => j.category === selectedCategory)
    return (
      <div className="fade-in">
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
          >←</button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
            {categoryEmojis[selectedCategory]} {selectedCategory}
          </h2>
        </div>
        <div style={{ padding: '0 20px' }}>
          {entries.map(entry => {
            const ts = getThemeStyle(entry.visualTheme)
            return (
              <div key={entry.day} className="card" style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                  {ts.emoji} {entry.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--lb-text-muted)', marginTop: 4 }}>
                  {entry.ot.book} {entry.ot.ch} + {entry.nt.book} {entry.nt.ch}
                </div>
                <div style={{ fontSize: 12, color: 'var(--lb-text-muted)' }}>
                  {entry.theme}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ padding: '16px 20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
          Explore Themes
        </h2>
        <p style={{ fontSize: 14, color: 'var(--lb-text-muted)' }}>
          Discover Bible stories by topic
        </p>
      </div>
      <div className="explore-grid">
        {CONTENT_CATEGORIES.map((cat, i) => {
          const colors = ['#4A90D9', '#4CAF50', '#FF6B6B', '#9B59B6', '#F5A623', '#0277BD', '#E65100', '#2E7D32', '#C62828', '#00796B']
          return (
            <button
              key={cat}
              className="explore-card"
              style={{ background: `linear-gradient(135deg, ${colors[i]}, ${colors[i]}CC)` }}
              onClick={() => setSelectedCategory(cat)}
            >
              <div className="explore-card-emoji">{categoryEmojis[cat]}</div>
              <div className="explore-card-title">{cat}</div>
              <div className="explore-card-count">{categoryCounts[cat] || 0} devotions</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// PROGRESS VIEW
// ═══════════════════════════════════════

function ProgressView({ child, completions }) {
  const totalDays = THEMATIC_JOURNEY.length
  const completedCount = completions.length
  const percentage = Math.round((completedCount / totalDays) * 100)
  
  // Books touched
  const booksExplored = new Set()
  completions.forEach(c => {
    if (c.ot_book) booksExplored.add(c.ot_book)
    if (c.nt_book) booksExplored.add(c.nt_book)
  })

  return (
    <div className="fade-in">
      <div className="progress-hero">
        <div className="progress-day-count">{completedCount}</div>
        <div className="progress-day-label">Devotions Completed</div>
      </div>

      <div className="progress-stats">
        <div className="progress-stat">
          <div className="progress-stat-value">🔥 {child.streak || 0}</div>
          <div className="progress-stat-label">Day Streak</div>
        </div>
        <div className="progress-stat">
          <div className="progress-stat-value">📖 {booksExplored.size}</div>
          <div className="progress-stat-label">Books Explored</div>
        </div>
        <div className="progress-stat">
          <div className="progress-stat-value">⭐ {child.verses_learned || 0}</div>
          <div className="progress-stat-label">Verses Learned</div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-label">
          Journey Progress — {percentage}%
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--lb-text-muted)', marginTop: 6 }}>
          {completedCount} of {totalDays} days
        </div>
      </div>

      {/* Recent completions */}
      <div style={{ padding: '0 20px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
          Recent Devotions
        </h3>
        {completions.slice(-5).reverse().map((c, i) => {
          const j = THEMATIC_JOURNEY[c.journey_day % THEMATIC_JOURNEY.length]
          const ts = getThemeStyle(j?.visualTheme || 'nature')
          return (
            <div key={i} className="card" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{ts.emoji}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
                  Day {c.journey_day + 1}: {j?.title || 'Devotion'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--lb-text-muted)' }}>
                  {new Date(c.completed_at).toLocaleDateString()}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 20 }}>✅</span>
            </div>
          )
        })}
        {completions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--lb-text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🌱</div>
            <p>Complete your first devotion to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// PARENT DASHBOARD
// ═══════════════════════════════════════

function ParentDashboard({ children: kidsList, selectedChild, onSelectChild, onAddChild, onSignOut }) {
  const [showAddChild, setShowAddChild] = useState(false)

  return (
    <div className="fade-in">
      <div className="parent-header">
        <h2>👨‍👩‍👧‍👦 Family Dashboard</h2>
      </div>

      <div className="parent-section">
        <div className="parent-section-title">Children</div>
        {kidsList.map(kid => (
          <div
            key={kid.id}
            className={`child-card ${selectedChild?.id === kid.id ? 'selected' : ''}`}
            onClick={() => onSelectChild(kid)}
          >
            <span className="child-card-avatar">{kid.avatar_emoji}</span>
            <div>
              <div className="child-card-name">{kid.name}</div>
              <div className="child-card-tier">
                {AGE_TIERS[kid.age_tier]?.label} · Day {(kid.current_day || 0) + 1} · 🔥 {kid.streak || 0}
              </div>
            </div>
          </div>
        ))}
        <button className="add-child-btn" onClick={() => setShowAddChild(true)}>
          + Add a Child
        </button>
      </div>

      <div className="parent-section">
        <div className="parent-section-title">Corpus Statistics</div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>Total principles indexed</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{(corpus.total || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>Books covered</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{Object.keys(corpus.books || {}).length}/66</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14 }}>Thematic journey entries</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{THEMATIC_JOURNEY.length}</span>
          </div>
        </div>
      </div>

      <div className="parent-section">
        <button className="btn btn-secondary btn-block" onClick={onSignOut}>
          Sign Out
        </button>
      </div>

      {showAddChild && (
        <AddChildModal
          onAdd={onAddChild}
          onClose={() => setShowAddChild(false)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [family, setFamily] = useState(null)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [completions, setCompletions] = useState([])
  const [tab, setTab] = useState('devotion')

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load family data when session exists
  useEffect(() => {
    if (session?.user) loadFamilyData()
  }, [session])

  const loadFamilyData = async () => {
    const userId = session.user.id

    // Get or create family
    let { data: fam } = await supabase
      .from('families')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (!fam) {
      const { data: newFam } = await supabase
        .from('families')
        .insert({ user_id: userId })
        .select()
        .single()
      fam = newFam
    }
    setFamily(fam)

    // Load children
    const { data: kids } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', fam.id)
      .order('created_at')
    
    setChildren(kids || [])
    
    // Auto-select first child
    if (kids?.length > 0) {
      const child = kids[0]
      setSelectedChild(child)
      loadCompletions(child.id)
    }
  }

  const loadCompletions = async (childId) => {
    const { data } = await supabase
      .from('completions')
      .select('*')
      .eq('child_id', childId)
      .order('completed_at')
    setCompletions(data || [])
  }

  const addChild = async ({ name, age_tier, avatar_emoji }) => {
    if (!family) return
    const { data: newChild } = await supabase
      .from('children')
      .insert({ family_id: family.id, name, age_tier, avatar_emoji })
      .select()
      .single()
    
    if (newChild) {
      setChildren(prev => [...prev, newChild])
      if (!selectedChild) {
        setSelectedChild(newChild)
        loadCompletions(newChild.id)
      }
    }
  }

  const selectChild = (child) => {
    setSelectedChild(child)
    loadCompletions(child.id)
    setTab('devotion')
  }

  const completeDevotionDay = async (journeyDay, journey) => {
    if (!selectedChild) return
    
    // Record completion
    await supabase.from('completions').upsert({
      child_id: selectedChild.id,
      journey_day: journeyDay,
      theme: journey.theme,
      ot_book: journey.ot.book,
      ot_chapter: journey.ot.ch,
      nt_book: journey.nt.book,
      nt_chapter: journey.nt.ch
    })

    // Update child progress
    const today = new Date().toISOString().split('T')[0]
    const isConsecutive = selectedChild.last_devotion_date === 
      new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    const newStreak = isConsecutive ? (selectedChild.streak || 0) + 1 : 1
    const newDay = Math.max((selectedChild.current_day || 0), journeyDay + 1)

    await supabase.from('children').update({
      current_day: newDay,
      streak: newStreak,
      last_devotion_date: today,
      verses_learned: (selectedChild.verses_learned || 0) + 1
    }).eq('id', selectedChild.id)

    // Update local state
    setSelectedChild(prev => ({
      ...prev,
      current_day: newDay,
      streak: newStreak,
      last_devotion_date: today,
      verses_learned: (prev.verses_learned || 0) + 1
    }))

    // Reload completions
    loadCompletions(selectedChild.id)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setFamily(null)
    setChildren([])
    setSelectedChild(null)
    setCompletions([])
  }

  // ─── RENDER ───

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '100vh' }}>
        <div className="loading-emoji">📖</div>
        <div className="loading-spinner" />
        <div className="loading-text">Loading Hallowed Drafts...</div>
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  // No children yet — prompt to add
  if (children.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="app-header">
          <div className="header-left">
            <span className="header-logo">📖</span>
            <span className="header-title">Hallowed Drafts</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>👶</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Welcome!</h2>
          <p style={{ color: 'var(--lb-text-muted)', marginBottom: 24 }}>Add a child to start their Bible journey</p>
          <AddChildModal onAdd={addChild} onClose={() => {}} />
        </div>
      </div>
    )
  }

  const currentDay = selectedChild?.current_day || 0

  return (
    <>
      {/* Header */}
      <div className="app-header">
        <div className="header-left">
          <span className="header-logo">📖</span>
          <span className="header-title">Hallowed Drafts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selectedChild?.streak > 0 && (
            <div className="header-streak">🔥 {selectedChild.streak}</div>
          )}
          <div className="header-avatar" onClick={() => setTab('parent')}>
            {selectedChild?.avatar_emoji || '🌱'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {tab === 'devotion' && selectedChild && (
          <DevotionView
            child={selectedChild}
            journeyDay={currentDay}
            onComplete={completeDevotionDay}
            familyId={family?.id}
          />
        )}
        {tab === 'explore' && <ExploreView child={selectedChild} />}
        {tab === 'progress' && <ProgressView child={selectedChild} completions={completions} />}
        {tab === 'parent' && (
          <ParentDashboard
            children={children}
            selectedChild={selectedChild}
            onSelectChild={selectChild}
            onAddChild={addChild}
            onSignOut={handleSignOut}
          />
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className={`nav-item ${tab === 'devotion' ? 'active' : ''}`} onClick={() => setTab('devotion')}>
          <span className="nav-icon">📖</span>
          Today
        </button>
        <button className={`nav-item ${tab === 'explore' ? 'active' : ''}`} onClick={() => setTab('explore')}>
          <span className="nav-icon">🔍</span>
          Explore
        </button>
        <button className={`nav-item ${tab === 'progress' ? 'active' : ''}`} onClick={() => setTab('progress')}>
          <span className="nav-icon">📊</span>
          Progress
        </button>
        <button className={`nav-item ${tab === 'parent' ? 'active' : ''}`} onClick={() => setTab('parent')}>
          <span className="nav-icon">👨‍👩‍👧</span>
          Family
        </button>
      </div>
    </>
  )
}

import { useState } from 'react'
import './App.css'

async function readApiResponse(response, fallbackMessage) {
  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error(fallbackMessage)
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(
      typeof payload?.message === 'string' && payload.message.trim()
        ? payload.message
        : fallbackMessage
    )
  }

  return payload
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [form, setForm] = useState({
    name: '',
    education: '',
    interest: '',
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [requestDuration, setRequestDuration] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [historyAssessments, setHistoryAssessments] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [historyInterestFilter, setHistoryInterestFilter] = useState('all')

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pathpilot-theme') === 'dark'
        ? 'dark'
        : 'light'
    } catch {
      return 'light'
    }
  })


  const filteredAssessments = historyAssessments.filter((assessment) => {
    const query = historySearch.trim().toLowerCase()
    const searchableText = [
      assessment.careerTitle,
      assessment.name,
      assessment.education,
      assessment.interest,
      assessment.description,
    ].filter(Boolean).join(' ').toLowerCase()

    const matchesSearch = !query || searchableText.includes(query)
    const matchesInterest =
      historyInterestFilter === 'all' ||
      assessment.interest === historyInterestFilter

    return matchesSearch && matchesInterest
  })


  const completedFields = Object.values(form).filter(
    value => value.trim() !== ''
  ).length

  const progress = Math.round((completedFields / 3) * 100)

  function handleChange(event) {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  function handleExportRecommendation() {
    if (!result) return

    const exportedAt = new Date().toLocaleString()

    const content = [
      'PATHPILOT — CAREER RECOMMENDATION',
      '=================================',
      '',
      `Name: ${form.name}`,
      `Education: ${form.education}`,
      `Interest: ${form.interest}`,
      `Career: ${result.title}`,
      '',
      'CAREER DESCRIPTION',
      '------------------',
      result.description || 'No description available.',
      '',
      'SKILLS TO DEVELOP',
      '-----------------',
      ...(result.skills || []).map((skill, index) => `${index + 1}. ${skill}`),
      '',
      'RECOMMENDED NEXT STEPS',
      '----------------------',
      ...(result.steps || []).map((step, index) => `${index + 1}. ${step}`),
      '',
      `Exported on: ${exportedAt}`,
      '',
      'This is an interest-based suggestion, not a guarantee of career suitability.',
    ].join('\n')

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeTitle = (result.title || 'career')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    link.href = url
    link.download = `pathpilot-${safeTitle || 'recommendation'}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function handleThemeToggle() {
    setTheme(currentTheme => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'

      try {
        localStorage.setItem('pathpilot-theme', nextTheme)
      } catch {
        // The theme still works for this session if storage is unavailable.
      }

      return nextTheme
    })
  }

  function handleReset() {
    setForm({ name: '', education: '', interest: '' })
    setResult(null)
    setRequestDuration(null)
    setError('')
    setNotice('')
    setActiveTab('assessment')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    setResult(null)
    setRequestDuration(null)

    const requestStartedAt = performance.now()

    try {
      const response = await fetch(
        'http://localhost:5001/api/careers/recommend',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            education: form.education,
            interest: form.interest,
          }),
        }
      )

      setRequestDuration(
        Math.round(performance.now() - requestStartedAt)
      )

      const payload = await readApiResponse(
        response,
        'Could not get a recommendation. Please try again.'
      )

      setResult({
        ...payload.data,
        steps: payload.data.nextSteps,
        assessmentId: payload.assessmentId,
      })
      setNotice('Success! Your career recommendation is ready.')
    } catch (err) {
      setError(
        err.message === 'Failed to fetch' || err instanceof TypeError
          ? 'Cannot reach the career server. Make sure the backend is running on port 5001, then try again.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleTabChange(tabId) {
    setActiveTab(tabId)

    if (tabId !== 'history') return

    setHistoryLoading(true)
    setHistoryError('')

    try {
      const response = await fetch(
        'http://localhost:5001/api/careers/assessments'
      )
      const payload = await readApiResponse(
        response,
        'Could not load assessment history. Please try again.'
      )

      setHistoryAssessments(
        Array.isArray(payload.data) ? payload.data : []
      )
    } catch (error) {
      setHistoryError(
        error.message === 'Failed to fetch' || error instanceof TypeError
          ? 'Cannot reach the career server. Make sure the backend is running on port 5001, then retry.'
          : error.message || 'Unable to load history. Please try again.'
      )
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className={`app ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <header className="navbar">
        <a
          className="brand"
          href="#home"
          onClick={() => setActiveTab('home')}
        >
          PathPilot<span>.</span>
        </a>

        <nav className="main-navigation" aria-label="Main navigation">
          {['Home', 'Assessment', 'History', 'About'].map(tab => {
            const tabId = tab.toLowerCase()

            return (
              <button
                key={tabId}
                type="button"
                className={`nav-tab ${activeTab === tabId ? 'active' : ''}`}
                aria-current={activeTab === tabId ? 'page' : undefined}
                onClick={() => handleTabChange(tabId)}
              >
                {tab}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          className="theme-toggle"
          onClick={handleThemeToggle}
          aria-pressed={theme === 'dark'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
        </button>
      </header>

      <main>
        {activeTab === 'home' && (
        <section className="hero" id="home">
          <p className="eyebrow">YOUR FUTURE STARTS HERE</p>
          <h1>
            Find a career that fits <span>your interests.</span>
          </h1>
          <p>
            Explore career options and discover the skills you can develop
            to move towards your goals.
          </p>
          <a
            className="primary-button"
            href="#assessment"
            onClick={() => setActiveTab('assessment')}
          >
            Explore Careers →
          </a>
        </section>
        )}

        {activeTab === 'assessment' && (
        <section className="assessment" id="assessment">
          <p className="eyebrow">CAREER ASSESSMENT</p>
          <h2>Tell us about yourself</h2>
          <p>Answer three questions to receive a career suggestion.</p>

          <div
            className="assessment-progress"
            role="progressbar"
            aria-label="Assessment completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="progress-label">
              <span>Assessment progress</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p>{completedFields} of 3 questions completed</p>
          </div>

          {error && (
            <p className="feedback-message error-message" role="alert">
              <span aria-hidden="true">⚠️ </span>
              {error}
            </p>
          )}

          {notice && (
            <p className="feedback-message success-message" role="status">
              <span aria-hidden="true">✓ </span>
              {notice}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <label>
              Your name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </label>

            <label>
              Education level
              <select
                name="education"
                value={form.education}
                onChange={handleChange}
                required
              >
                <option value="">Choose education</option>
                <option>School student</option>
                <option>Undergraduate</option>
                <option>Graduate</option>
                <option>Working professional</option>
              </select>
            </label>

            <label>
              Main area of interest
              <select
                name="interest"
                value={form.interest}
                onChange={handleChange}
                required
              >
                <option value="">Choose an interest</option>
                <option value="technology">Technology and coding</option>
                <option value="design">Design and creativity</option>
                <option value="business">Business and data</option>
                <option value="healthcare">Healthcare and wellbeing</option>
              </select>
            </label>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Getting Recommendation...'
                : 'Get My Recommendation →'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset Assessment
            </button>
          </form>
        </section>
        )}

        {activeTab === 'assessment' && result && (
          <section className="results" aria-live="polite">
            <div className="celebration-message">
              <span className="celebration-icon" aria-hidden="true">🎉</span>
              <h2>Congratulations, {form.name}!</h2>
              <p>You've taken a positive step towards discovering your career path.</p>
            </div>

            <p className="eyebrow">YOUR CAREER SUGGESTION</p>
            <h2>{form.name}, explore this career!</h2>

            <article className="career-card">
              <h3>{result.title}</h3>
              <p>{result.description}</p>
              {requestDuration !== null && (
                <p className="request-duration">
                  <strong>Request duration:</strong> {requestDuration} ms
                </p>
              )}
              <p>
                <strong>Education:</strong> {form.education}
              </p>

              <h4>Skills to develop</h4>
              <ul>
                {result.skills.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>

              <h4>Recommended next steps</h4>
              <ol>
                {result.steps.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>

            {result.assessmentId && (
              <p className="disclaimer">
                Your assessment has been saved successfully.
              </p>
            )}

            <button
              className="primary-button"
              type="button"
              onClick={handleExportRecommendation}
            >
              Download Recommendation
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={handleReset}
            >
              Start Over
            </button>
          </section>
        )}
        {activeTab === 'history' && (
          <section className="page-section history-section">
            <p className="eyebrow">YOUR PROGRESS</p>
            <h2>Assessment History</h2>
            <p>Review your previously saved career recommendations.</p>

            <button
              type="button"
              className="primary-button history-refresh"
              onClick={() => handleTabChange('history')}
              disabled={historyLoading}
            >
              {historyLoading ? 'Refreshing...' : 'Refresh history'}
            </button>

            {historyLoading && (
              <p role="status">Loading your saved assessments...</p>
            )}

            {historyError && (
              <div className="history-error" role="alert">
                <p>{historyError}</p>
                <button
                  type="button"
                  className="history-retry"
                  onClick={() => handleTabChange('history')}
                >
                  Try again
                </button>
              </div>
            )}

            {!historyLoading && !historyError &&
              historyAssessments.length === 0 && (
                <div className="history-empty">
                  <h3>No assessments yet</h3>
                  <p>
                    Complete a career assessment and your saved
                    recommendation will appear here.
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setActiveTab('assessment')}
                  >
                    Start an assessment
                  </button>
                </div>
              )}

            {!historyLoading && !historyError &&
              historyAssessments.length > 0 && (
                <>
                  <div className="history-filters">
                    <label>
                      Search assessments
                      <input
                        type="search"
                        value={historySearch}
                        onChange={(event) => setHistorySearch(event.target.value)}
                        placeholder="Search career, name, education..."
                      />
                    </label>

                    <label>
                      Filter by interest
                      <select
                        value={historyInterestFilter}
                        onChange={(event) => setHistoryInterestFilter(event.target.value)}
                      >
                        <option value="all">All interests</option>
                        <option value="technology">Technology and coding</option>
                        <option value="design">Design and creativity</option>
                        <option value="business">Business and data</option>
                        <option value="healthcare">Healthcare and wellbeing</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      className="history-retry"
                      onClick={() => {
                        setHistorySearch('')
                        setHistoryInterestFilter('all')
                      }}
                      disabled={!historySearch && historyInterestFilter === 'all'}
                    >
                      Clear filters
                    </button>
                  </div>

                  <div className="history-list">
                  <p className="history-count">
                    Showing {filteredAssessments.length} of {historyAssessments.length}{' '}
                    saved assessment{historyAssessments.length === 1 ? '' : 's'}
                  </p>

                  {filteredAssessments.length === 0 ? (
                    <div className="history-empty">
                      <h3>No matching assessments</h3>
                      <p>Try another search term or choose a different interest.</p>
                    </div>
                  ) : filteredAssessments.map((assessment) => (
                    <article
                      className="history-card"
                      key={assessment._id}
                    >
                      <div className="history-card-heading">
                        <h3>{assessment.careerTitle}</h3>
                        <time dateTime={assessment.createdAt}>
                          {assessment.createdAt
                            ? new Date(assessment.createdAt).toLocaleString()
                            : 'Date unavailable'}
                        </time>
                      </div>

                      <p>{assessment.description}</p>

                      <p className="history-meta">
                        <strong>Name:</strong> {assessment.name}
                        {' · '}
                        <strong>Education:</strong> {assessment.education}
                      </p>

                      {assessment.skills?.length > 0 && (
                        <div className="history-detail">
                          <h4>Recommended skills</h4>
                          <ul>
                            {assessment.skills.map((skill, index) => (
                              <li key={`${assessment._id}-skill-${index}`}>
                                {skill}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {assessment.nextSteps?.length > 0 && (
                        <div className="history-detail">
                          <h4>Next steps</h4>
                          <ol>
                            {assessment.nextSteps.map((step, index) => (
                              <li key={`${assessment._id}-step-${index}`}>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </article>
                  ))}
                  </div>
                </>
              )}
          </section>
        )}

        {activeTab === 'about' && (
          <section className="page-section">
            <p className="eyebrow">ABOUT PATHPILOT</p>
            <h2>Your career journey starts here.</h2>
            <p>
              PathPilot helps you explore career options based on
              your education and interests.
            </p>
            <p>Version 1.0.0</p>
          </section>
        )}

      </main>

      <footer>
        <a className="brand" href="#home">
          PathPilot<span>.</span>
        </a>
        <p>Explore your interests. Build your future.</p>
      </footer>
    </div>
  )
}

export default App

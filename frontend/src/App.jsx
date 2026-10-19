import { useState } from 'react'
import './App.css'

const careers = {
  technology: {
    title: 'Software Developer',
    description: 'Build websites and applications.',
    skills: ['JavaScript', 'Problem solving', 'Git'],
    steps: ['Learn JavaScript', 'Build a website', 'Practice coding'],
  },
  design: {
    title: 'UI/UX Designer',
    description: 'Design user-friendly digital products.',
    skills: ['Figma', 'Visual design', 'User research'],
    steps: ['Learn design principles', 'Practice with Figma', 'Build a portfolio'],
  },
  business: {
    title: 'Business Analyst',
    description: 'Use data to solve business problems.',
    skills: ['Excel', 'Communication', 'Data analysis'],
    steps: ['Learn Excel', 'Analyse data', 'Complete a small project'],
  },
  healthcare: {
    title: 'Healthcare Professional',
    description: 'Explore careers focused on health and wellbeing.',
    skills: ['Subject knowledge', 'Communication', 'Critical thinking'],
    steps: ['Research courses', 'Check qualifications', 'Explore training'],
  },
}

function App() {
  const [form, setForm] = useState({
    name: '',
    education: '',
    interest: '',
  })
  const [result, setResult] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setResult(careers[form.interest])
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">PathPilot<span>.</span></a>
        <a href="#assessment">Career Assessment</a>
      </header>

      <main>
        <section className="hero" id="home">
          <p className="eyebrow">YOUR FUTURE STARTS HERE</p>
          <h1>Find a career that fits <span>your interests.</span></h1>
          <p>
            Explore career options and discover the skills you can develop
            to move towards your goals.
          </p>
          <a className="primary-button" href="#assessment">
            Explore Careers →
          </a>
        </section>

        <section className="assessment" id="assessment">
          <p className="eyebrow">CAREER ASSESSMENT</p>
          <h2>Tell us about yourself</h2>
          <p>Answer three questions to receive a career suggestion.</p>

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
              <select name="education" value={form.education}
                onChange={handleChange} required>
                <option value="">Choose education</option>
                <option>School student</option>
                <option>Undergraduate</option>
                <option>Graduate</option>
                <option>Working professional</option>
              </select>
            </label>

            <label>
              Main area of interest
              <select name="interest" value={form.interest}
                onChange={handleChange} required>
                <option value="">Choose an interest</option>
                <option value="technology">Technology and coding</option>
                <option value="design">Design and creativity</option>
                <option value="business">Business and data</option>
                <option value="healthcare">Healthcare and wellbeing</option>
              </select>
            </label>

            <button className="primary-button" type="submit">
              Get My Recommendation →
            </button>
          </form>
        </section>

        {result && (
          <section className="results" aria-live="polite">
            <p className="eyebrow">YOUR CAREER SUGGESTION</p>
            <h2>{form.name}, explore this career!</h2>

            <article className="career-card">
              <h3>{result.title}</h3>
              <p>{result.description}</p>
              <p><strong>Education:</strong> {form.education}</p>

              <h4>Skills to develop</h4>
              <ul>
                {result.skills.map(skill => <li key={skill}>{skill}</li>)}
              </ul>

              <h4>Recommended next steps</h4>
              <ol>
                {result.steps.map(step => <li key={step}>{step}</li>)}
              </ol>
            </article>

            <p className="disclaimer">
              This is a basic interest-based suggestion, not a guarantee
              of career suitability.
            </p>
          </section>
        )}
      </main>

      <footer>
        <a className="brand" href="#home">PathPilot<span>.</span></a>
        <p>Explore your interests. Build your future.</p>
      </footer>
    </div>
  )
}

export default App

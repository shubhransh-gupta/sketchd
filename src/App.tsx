import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CategoryId, FlowStep, QuestionId, RoutingResult } from './engine/types';
import { CATEGORIES } from './engine/types';
import { classifyProblem } from './engine/classifier';
import { getQuestionsForCategory } from './engine/questions';
import { routeComplaint } from './engine/router';
import {
  findNearestLocation,
  getAllLocations,
  getLocationsByState,
  getStates,
  resolveLocationQuery,
} from './lib/location';
import LocationMap from './components/LocationMap';
import type { LocationEntry } from './engine/types';
import './styles/app.css';

function confidenceClass(c: string) {
  if (c === 'high') return 'confidence confidence-high';
  if (c === 'likely') return 'confidence confidence-likely';
  return 'confidence confidence-uncertain';
}

function confidenceLabel(c: string) {
  if (c === 'high') return '🟢 High confidence';
  if (c === 'likely') return '🟡 Likely';
  return '🟠 Uncertain';
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const [step, setStep] = useState<FlowStep>('home');
  const [problemText, setProblemText] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [location, setLocation] = useState<LocationEntry | null>(null);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showEscalation, setShowEscalation] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const classification = useMemo(() => classifyProblem(problemText), [problemText]);

  const pendingQuestions = useMemo(() => {
    if (!category) return [];
    return getQuestionsForCategory(category, answers);
  }, [category, answers]);

  const handleStart = () => {
    const cat = classification?.category ?? category;
    if (cat) {
      setCategory(cat);
      setStep('category');
    } else if (problemText.trim()) {
      setStep('category');
    }
  };

  const handleCategorySelect = (cat: CategoryId) => {
    setCategory(cat);
    setAnswers({});
    setStep('location');
  };

  const handleLocationSelect = (loc: LocationEntry) => {
    setLocation(loc);
    setGeoError('');
    setMapReady(false);
    setStep('map');
    setTimeout(() => {
      const qs = getQuestionsForCategory(category!, {});
      if (qs.length > 0) {
        setStep('questions');
      } else {
        computeResult(loc, answers);
      }
    }, 900);
  };

  const computeResult = useCallback(
    (loc: LocationEntry, ans: Partial<Record<QuestionId, string>>) => {
      if (!category) return;
      const r = routeComplaint(category, loc, ans, problemText);
      setResult(r);
      setStep('result');
    },
    [category, problemText],
  );

  const handleAnswer = (qId: QuestionId, value: string) => {
    const next = { ...answers, [qId]: value };
    setAnswers(next);
    const remaining = getQuestionsForCategory(category!, next);
    if (remaining.length === 0 && location) {
      computeResult(location, next);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = findNearestLocation(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
        if (loc) {
          handleLocationSelect(loc);
        } else {
          setGeoError('Your location is outside our supported cities. Please select manually.');
        }
      },
      () => {
        setGeoLoading(false);
        setGeoError('Could not get your location. Please enter it manually.');
      },
      { timeout: 10000 },
    );
  };

  const handleLocationSearch = () => {
    const loc = resolveLocationQuery(locationQuery);
    if (loc) handleLocationSelect(loc);
    else setGeoError('Location not found. Try Bengaluru, Mumbai, Delhi, Lucknow, Noida, or Mysuru.');
  };

  const reset = () => {
    setStep('home');
    setProblemText('');
    setCategory(null);
    setLocation(null);
    setAnswers({});
    setResult(null);
    setLocationQuery('');
    setGeoError('');
    setShowEscalation(false);
    setMapReady(false);
  };

  const categoryInfo = CATEGORIES.find((c) => c.id === category);

  return (
    <>
      <div className="app">
        <header className="header">
          <div className="logo" onClick={reset} style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && reset()}>
            FixFr <span className="logo-badge">FR</span>
          </div>
          <button className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        {step === 'home' && (
          <section className="hero fade-up">
            <h1>Who owns this problem?</h1>
            <p>
              You shouldn't need to know which government department handles it.
              Tell us what's wrong — we'll find the right authority, the official complaint channel,
              and what to do if nothing happens.
            </p>
            <div className="search-box">
              <input
                className="search-input"
                placeholder="There's garbage outside my house..."
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                autoFocus
              />
              {classification && (
                <div className="detected">
                  Detected: <strong>{classification.label}</strong>
                  {' · '}Confidence: {classification.confidence}
                </div>
              )}
            </div>
            <button className="btn-primary" onClick={handleStart} disabled={!problemText.trim()}>
              Find who to contact →
            </button>
            <p className="coverage-note" style={{ marginTop: '1.5rem' }}>
              No login. No complaint submission. Just the right place to go.
              <br />
              Coverage varies by location — currently Bengaluru, Mysuru, Lucknow, Noida, Mumbai, Delhi.
            </p>
          </section>
        )}

        {step === 'category' && (
          <section className="section fade-up">
            <button className="back-btn" onClick={() => setStep('home')}>← Back</button>
            <p className="flow-label">What is the problem?</p>
            <div className="category-grid">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`category-btn ${category === c.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(c.id)}
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 'location' && (
          <section className="section fade-up">
            <button className="back-btn" onClick={() => setStep('category')}>← Back</button>
            <p className="flow-label">Where is this happening?</p>
            <div className="location-methods">
              <button className="btn-secondary" onClick={handleGeolocation} disabled={geoLoading}>
                {geoLoading ? 'Finding location...' : '📍 Use my location'}
              </button>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <input
                className="location-input"
                placeholder="Enter city or PIN code (e.g. Bengaluru, 560001)"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <button className="btn-primary" onClick={handleLocationSearch} style={{ width: '100%' }}>
                Search location
              </button>
            </div>
            <p className="section-title">Or select manually</p>
            <div className="select-row">
              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                <option value="">State</option>
                {getStates().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                disabled={!selectedState}
                onChange={(e) => {
                  const loc = getAllLocations().find((l) => l.id === e.target.value);
                  if (loc) handleLocationSelect(loc);
                }}
                defaultValue=""
              >
                <option value="">City</option>
                {selectedState && getLocationsByState(selectedState).map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            {geoError && <p style={{ color: 'var(--red)', fontSize: '0.875rem', marginTop: '0.75rem' }}>{geoError}</p>}
          </section>
        )}

        {(step === 'map' || step === 'questions' || step === 'result') && location && (
          <section className="section fade-up">
            <LocationMap location={location} onReady={() => setMapReady(true)} />
            <div className="location-card">
              <div>
                <div className="location-card-name">📍 {location.name}</div>
                <div className="location-card-sub">{location.state}, India</div>
              </div>
              <button className="btn-secondary" onClick={() => { setStep('location'); setResult(null); }}>
                Change
              </button>
            </div>
            {step === 'map' && !mapReady && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                Problems reported here are usually handled by local civic authorities...
              </p>
            )}
          </section>
        )}

        {step === 'questions' && category && (
          <section className="section fade-up">
            <button className="back-btn" onClick={() => setStep('location')}>← Back</button>
            {pendingQuestions.slice(0, 1).map((q) => (
              <div key={q.id}>
                <p className="flow-label">{q.text}</p>
                <div className="option-list">
                  {q.options.map((opt) => (
                    <button
                      key={opt.id}
                      className={`option-btn ${answers[q.id] === opt.id ? 'selected' : ''}`}
                      onClick={() => handleAnswer(q.id, opt.id)}
                    >
                      <span className="option-radio" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {step === 'result' && result && location && (
          <section className="section fade-up">
            {result.isEmergency && (
              <div className="emergency-banner">
                <h3>⚠️ This may be an emergency</h3>
                <p>{result.emergencyMessage}</p>
                {result.emergencyContacts && (
                  <div className="emergency-numbers">
                    {result.emergencyContacts.map((c) => (
                      <a key={c.label} className="emergency-num" href={`tel:${c.number}`}>
                        {c.label}: {c.number}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="routing-chain">
              <div className="routing-chain-step">📍 <strong>WHERE</strong><br />{location.name}, {location.state}</div>
              <div className="routing-chain-arrow">↓</div>
              <div className="routing-chain-step">🏛 <strong>WHO</strong><br />{result.primary.authority.shortName ?? result.primary.authority.name}</div>
              <div className="routing-chain-arrow">↓</div>
              <div className="routing-chain-step">🔗 <strong>WHERE TO REPORT</strong><br />Official complaint channel</div>
            </div>

            <div className="result-card">
              <p className="section-title">Your problem</p>
              <p style={{ fontWeight: 600 }}>{categoryInfo?.emoji} {result.problemLabel}</p>

              <div className="result-divider" />

              <p className="section-title">Most likely authority</p>
              <p className="authority-name">🏛 {result.primary.authority.shortName ?? result.primary.authority.name}</p>
              {result.primary.department && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {result.primary.department.replace(/_/g, ' ')}
                </p>
              )}
              <div style={{ marginTop: '0.5rem' }}>
                <span className={confidenceClass(result.primary.confidence)}>
                  {confidenceLabel(result.primary.confidence)}
                </span>
              </div>

              <div className="result-divider" />

              <div className="why-block">
                <strong>Why?</strong>
                {result.primary.reason}
              </div>

              {result.secondary && (
                <div className="secondary-auth">
                  <strong>Also consider: {result.secondary.authority.shortName ?? result.secondary.authority.name}</strong>
                  {result.secondary.reason}
                </div>
              )}

              <div className="result-divider" />

              <p className="section-title">Report it</p>
              {result.primary.authority.complaint_channels.map((ch) =>
                ch.type === 'web' && ch.url ? (
                  <a
                    key={ch.url}
                    className="portal-btn"
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open official portal ↗
                  </a>
                ) : ch.type === 'phone' && ch.value ? (
                  <a key={ch.value} className="btn-secondary" href={`tel:${ch.value}`} style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
                    📞 {ch.label}: {ch.value}
                  </a>
                ) : null,
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Official website — FixFr does not submit complaints on your behalf.
              </p>

              <div className="result-divider" />

              <p className="section-title">What to include</p>
              <ul className="checklist">
                {result.submitChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="result-divider" />

              <button className="btn-secondary" onClick={() => setShowEscalation(!showEscalation)}>
                {showEscalation ? 'Hide' : 'View'} escalation path
              </button>
              {showEscalation && (
                <ol className="escalation-list" style={{ marginTop: '0.75rem' }}>
                  {result.escalation.map((s) => (
                    <li key={s.order}>{s.label}</li>
                  ))}
                </ol>
              )}
            </div>

            <button className="btn-secondary" onClick={reset} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              Start over
            </button>
          </section>
        )}
      </div>

      <footer className="footer">
        FixFr — Fix, for real. Open source civic routing.{' '}
        <a href="https://github.com/shubhransh-gupta/fixfr" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </>
  );
}

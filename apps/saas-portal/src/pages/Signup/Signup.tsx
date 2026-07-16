import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Signup.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$49/mo', features: ['Up to 25 users', 'Core dashboard', 'Audit logs'] },
  { id: 'enterprise', name: 'Enterprise', price: '$199/mo', features: ['Unlimited users', 'All plugins', '24/7 support'], highlight: true },
  { id: 'custom', name: 'Custom', price: 'Custom', features: ['Up to 1000 users', 'Dedicated instance', 'Custom integrations'] },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const strength = (pwd: string): number => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ea4335', '#fbbc04', '#34a853', '#1a73e8'];

const STEPS = ['Plan', 'Account', 'Billing', 'Done'];

export const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(searchParams.get('plan') || 'starter');
  const [form, setForm] = useState({
    orgName: '', orgSlug: '',
    firstName: '', lastName: '',
    email: '', password: '',
  });
  const [slugManual, setSlugManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgId, setOrgId] = useState('');

  useEffect(() => {
    if (!slugManual && form.orgName) {
      setForm(f => ({ ...f, orgSlug: slugify(form.orgName) }));
    }
  }, [form.orgName, slugManual]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const nextStep = () => {
    if (step === 1) {
      if (!form.orgName || !form.orgSlug || !form.firstName || !form.email || form.password.length < 8) {
        setError('Please fill in all required fields before continuing.');
        return;
      }
    }
    setError('');
    setStep(s => s + 1);
  };
  const prevStep = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: form.orgName,
          orgSlug: form.orgSlug,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          tier: plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setOrgId(data.data?.organization?.id || '');
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToApp = () => {
    window.open(`${APP_URL}/login?registered=true`, '_blank', 'noopener,noreferrer');
  };

  const pwdStrength = strength(form.password);

  return (
    <div className="signup-page">
      <div className="signup-panel signup-panel--left">
        <button className="signup-back-home" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to site
        </button>

        <div className="signup-brand">
          <div className="signup-brand__logo">Atlas<span>.</span></div>
          <p className="signup-brand__tagline">The operating system for modern business.</p>
        </div>

        <ul className="signup-trust-list">
          {['Free 14-day trial, no card required', 'Setup in under 5 minutes', 'Your data stays yours — always', 'Cancel anytime, no lock-in'].map(t => (
            <li key={t}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#1a73e820" />
                <path d="M5 8l2 2 4-4" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </li>
          ))}
        </ul>

        <div className="signup-testimonial">
          <p>"Atlas onboarded our whole company in a day. Truly impressive."</p>
          <div className="signup-testimonial__author">
            <div className="signup-testimonial__avatar">LT</div>
            <div>
              <div className="signup-testimonial__name">Lisa Tanaka</div>
              <div className="signup-testimonial__role">IT Manager, HorizonEdu</div>
            </div>
          </div>
        </div>
      </div>

      <div className="signup-panel signup-panel--right">
        <div className="signup-progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`signup-progress__step${i <= step ? ' signup-progress__step--done' : ''}`}>
              <div className="signup-progress__dot">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="signup-progress__line" />}
            </div>
          ))}
        </div>

        <div className="signup-form-area">
          <AnimatePresence mode="wait">

            {step === 0 && (
              <motion.div key="plan" className="signup-step" {...slideAnim}>
                <h2 className="signup-step__title">Choose your plan</h2>
                <p className="signup-step__sub">Start free for 14 days. No credit card needed.</p>
                <div className="plan-cards">
                  {PLANS.map(p => (
                    <button
                      key={p.id}
                      className={`plan-card${plan === p.id ? ' plan-card--active' : ''}${p.highlight ? ' plan-card--highlight' : ''}`}
                      onClick={() => setPlan(p.id)}
                    >
                      {p.highlight && <div className="plan-card__badge">Popular</div>}
                      <div className="plan-card__name">{p.name}</div>
                      <div className="plan-card__price">{p.price}</div>
                      <ul>
                        {p.features.map(f => <li key={f}>{f}</li>)}
                      </ul>
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary w-full" style={{ marginTop: '1.5rem' }} onClick={nextStep}>
                  Continue with {PLANS.find(p2 => p2.id === plan)?.name}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="account" className="signup-step" {...slideAnim}>
                <h2 className="signup-step__title">Set up your account</h2>
                <p className="signup-step__sub">This creates your organisation and admin user.</p>

                <div className="form-group">
                  <label>Organisation Name</label>
                  <input type="text" placeholder="Acme Inc." value={form.orgName} onChange={set('orgName')} required />
                </div>
                <div className="form-group">
                  <label>Workspace URL</label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">atlas.io/</span>
                    <input
                      type="text"
                      value={form.orgSlug}
                      placeholder="acme-inc"
                      onChange={e => { setSlugManual(true); setForm(f => ({ ...f, orgSlug: slugify(e.target.value) })); }}
                    />
                  </div>
                  {form.orgSlug && <small className="input-hint">Your workspace: <strong>atlas.io/{form.orgSlug}</strong></small>}
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" placeholder="Jane" value={form.firstName} onChange={set('firstName')} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" placeholder="Smith" value={form.lastName} onChange={set('lastName')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Work Email</label>
                  <input type="email" placeholder="jane@acme.com" value={form.email} onChange={set('email')} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
                  {form.password && (
                    <div className="pwd-meter">
                      <div className="pwd-meter__bars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="pwd-meter__bar" style={{ background: i <= pwdStrength ? STRENGTH_COLORS[pwdStrength] : 'var(--border-strong)' }} />
                        ))}
                      </div>
                      <span style={{ color: STRENGTH_COLORS[pwdStrength] }}>{STRENGTH_LABELS[pwdStrength]}</span>
                    </div>
                  )}
                </div>

                {error && <div className="signup-error">{error}</div>}

                <div className="signup-step__actions">
                  <button className="btn btn-ghost" onClick={prevStep}>Back</button>
                  <button
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={!form.orgName || !form.orgSlug || !form.firstName || !form.email || form.password.length < 8}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="billing" className="signup-step" {...slideAnim}>
                <h2 className="signup-step__title">Billing details</h2>
                <p className="signup-step__sub">Your 14-day trial is free. You won't be charged until it ends.</p>

                <div className="billing-mock-card">
                  <div className="billing-mock-card__header">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect width="28" height="28" rx="6" fill="#1a73e820" />
                      <path d="M4 10h20M4 14h8" stroke="#1a73e8" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <span>Stripe Payments</span>
                    <span className="billing-mock-card__badge">Secured</span>
                  </div>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242" disabled value="4242 4242 4242 4242" className="input-mock" />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Expiry</label>
                      <input type="text" placeholder="MM/YY" disabled value="12/27" className="input-mock" />
                    </div>
                    <div className="form-group">
                      <label>CVC</label>
                      <input type="text" placeholder="•••" disabled value="•••" className="input-mock" />
                    </div>
                  </div>
                  <div className="billing-notice">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#fbbc04" strokeWidth="1.5" />
                      <path d="M8 5v4M8 11v.5" stroke="#fbbc04" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Billing integration coming soon — no charges will be made during setup.
                  </div>
                </div>

                {error && <div className="signup-error">{error}</div>}

                <div className="signup-step__actions">
                  <button className="btn btn-ghost" onClick={prevStep}>Back</button>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating your workspace…' : 'Create My Workspace →'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="done" className="signup-step signup-step--success" {...slideAnim}>
                <div className="success-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#1a73e820" />
                    <path d="M10 16l4 4 8-8" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="signup-step__title">Your workspace is ready! 🎉</h2>
                <p className="signup-step__sub">
                  Organisation <strong>{form.orgName}</strong> has been created.
                  {orgId && <> Your Safe ID: <code>{orgId.slice(0, 8).toUpperCase()}</code></>}
                </p>
                <p className="signup-step__sub" style={{ fontSize: 'var(--font-sm)' }}>
                  Sign in to your new workspace and start setting up your team.
                </p>
                <button className="btn btn-primary btn-lg" onClick={goToApp} style={{ marginTop: '1rem' }}>
                  Go to Atlas Platform →
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const slideAnim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

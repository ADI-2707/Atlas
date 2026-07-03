import { motion } from 'framer-motion';
import './Hero.css';

const WORDS = ['Unified', 'Fast', 'Powerful'];

const StatChip = ({ value, label }: { value: string; label: string }) => (
  <div className="stat-chip">
    <span className="stat-chip__value">{value}</span>
    <span className="stat-chip__label">{label}</span>
  </div>
);

export const Hero = () => {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-content">

        <motion.div
          className="label-chip"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="pulse-dot" />
          Atlas OS 2.0 — Now Available
        </motion.div>

        <h1 className="hero-title">
          {['The', 'Operating', 'System', 'for'].map((word, i) => (
            <motion.span
              key={word + i}
              className="hero-title__word"
              initial={{ opacity: 0, y: 32, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
          <br />
          {WORDS.map((word, i) => (
            <motion.span
              key={word}
              className="hero-title__word hero-title__word--accent"
              initial={{ opacity: 0, y: 32, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: 0.38 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}{i < WORDS.length - 1 ? ', ' : ''}
            </motion.span>
          ))}
          <motion.span
            className="hero-title__word"
            initial={{ opacity: 0, y: 32, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.55, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
          >
            Enterprises.
          </motion.span>
        </h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          Replace your fragmented software stack with one unified, incredibly fast platform.
          CRM, HR, Inventory, and Analytics — seamlessly connected.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.84, ease: [0.16, 1, 0.3, 1] }}
        >
          <a href="/signup" className="btn btn-primary btn-lg">
            Start Free Trial
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#about" className="btn btn-ghost btn-lg">
            See How It Works
          </a>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <StatChip value="2,400+" label="companies" />
          <div className="hero-stats__sep" />
          <StatChip value="99.9%" label="uptime SLA" />
          <div className="hero-stats__sep" />
          <StatChip value="<50ms" label="API response" />
          <div className="hero-stats__sep" />
          <StatChip value="SOC 2" label="certified" />
        </motion.div>
      </div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="dashboard-mockup">
          <div className="mockup-chrome">
            <div className="chrome-dots">
              <span /><span /><span />
            </div>
            <div className="chrome-url">app.atlas.io — Dashboard</div>
          </div>
          <div className="mockup-body">
            <div className="mockup-sidebar">
              <div className="sidebar-logo" />
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`sidebar-item${i === 1 ? ' sidebar-item--active' : ''}`} />
              ))}
            </div>
            <div className="mockup-main">
              <div className="kpi-row">
                {['#1a73e8', '#34a853', '#ea4335', '#fbbc04'].map((color, i) => (
                  <div key={i} className="kpi-card">
                    <div className="kpi-card__bar" style={{ background: color, opacity: 0.15 }} />
                    <div className="kpi-card__line" style={{ background: color }} />
                    <div className="kpi-card__value" />
                    <div className="kpi-card__label" />
                  </div>
                ))}
              </div>
              <div className="chart-area">
                <div className="chart-bars">
                  {[60, 80, 45, 90, 70, 95, 55, 75, 88, 65, 72, 84].map((h, i) => (
                    <div
                      key={i}
                      className="chart-bar"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>
              </div>
              <div className="table-skeleton">
                <div className="table-row table-row--header">
                  {[3, 5, 4, 3].map((w, i) => (
                    <div key={i} className="table-cell table-cell--header" style={{ flex: w }} />
                  ))}
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="table-row">
                    {[3, 5, 4, 3].map((w, j) => (
                      <div key={j} className="table-cell" style={{ flex: w, opacity: 1 - i * 0.2 }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="float-card float-card--left"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="float-card__icon" style={{ background: '#34a85320' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#34a853" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" stroke="#34a853" strokeWidth="2" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#34a853" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="float-card__title">HR Module</div>
            <div className="float-card__sub">48 employees synced</div>
          </div>
        </motion.div>

        <motion.div
          className="float-card float-card--right"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <div className="float-card__icon" style={{ background: '#1a73e820' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="float-card__title">Analytics</div>
            <div className="float-card__sub">↑ 23% this month</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

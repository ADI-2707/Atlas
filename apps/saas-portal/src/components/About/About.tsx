import { motion } from 'framer-motion';
import './About.css';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="#1a73e8" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: '#1a73e8',
    tag: 'HR',
    title: 'People Management',
    desc: 'Full-cycle HR — onboarding, payroll, leave management, org charts, and compliance. Every employee action in one place.',
    metrics: ['48 HR workflows', 'Payroll automation', 'Leave tracking'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#34a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#34a853',
    tag: 'CRM',
    title: 'Customer Relations',
    desc: 'Pipeline management, deal tracking, customer history, and automated follow-ups. Turn leads into loyal customers.',
    metrics: ['Visual pipeline', 'Deal analytics', 'Auto follow-ups'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="#ea4335" strokeWidth="2"/>
        <path d="M8 21h8M12 17v4" stroke="#ea4335" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 8h.01M10 8h4M6 12h12" stroke="#ea4335" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: '#ea4335',
    tag: 'Inventory',
    title: 'Stock & Warehousing',
    desc: 'Real-time stock levels, multi-warehouse transfers, SKU tracking, and supplier orders — no more spreadsheets.',
    metrics: ['Multi-warehouse', 'Low-stock alerts', 'SKU tracking'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 3v18" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 8h5" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 12h5" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#8b5cf6',
    tag: 'Projects',
    title: 'Project Management',
    desc: 'Kanban boards, project timelines, milestone tracking, and task delegation. Keep your workspace operations fully aligned.',
    metrics: ['Interactive kanban', 'Gantt charts', 'Milestone tracking'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#fbbc04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#fbbc04',
    tag: 'Analytics',
    title: 'Business Intelligence',
    desc: 'Unified dashboards pulling from every plugin. Spot trends, export reports, and make decisions backed by real data.',
    metrics: ['Live dashboards', 'Custom reports', 'Data export'],
  },
];

const card = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};

export const About = () => (
  <section className="about-section" id="about">
    <div className="section-container">
      <div className="section-header">
        <motion.span
          className="label-chip"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          The Platform
        </motion.span>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.05 }}
        >
          Every tool your business needs,<br />finally in one place.
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Atlas is a modular platform. Start with the core and activate plugins as you grow.
        </motion.p>
      </div>

      <motion.div
        className="features-grid"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {FEATURES.map((f) => (
          <motion.div key={f.tag} className="feature-card" variants={card}>
            <div className="feature-card__header">
              <div className="feature-card__icon" style={{ background: `${f.color}14` }}>
                {f.icon}
              </div>
              <span className="feature-card__tag" style={{ color: f.color, background: `${f.color}12` }}>
                {f.tag}
              </span>
            </div>
            <h3 className="feature-card__title">{f.title}</h3>
            <p className="feature-card__desc">{f.desc}</p>
            <ul className="feature-card__metrics">
              {f.metrics.map((m) => (
                <li key={m}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="6" fill={`${f.color}20`}/>
                    <path d="M3.5 6l1.8 1.8 3.2-3.2" stroke={f.color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {m}
                </li>
              ))}
            </ul>
            <div className="feature-card__glow" style={{ background: `${f.color}08` }} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

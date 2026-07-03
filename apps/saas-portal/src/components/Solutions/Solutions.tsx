import { motion } from 'framer-motion';
import './Solutions.css';

const SOLUTIONS = [
  {
    icon: '🏭',
    title: 'Manufacturing & Supply Chain',
    desc: 'Track raw materials, manage suppliers, automate purchase orders, and keep production flowing without interruption.',
  },
  {
    icon: '🏥',
    title: 'Healthcare & Clinics',
    desc: 'Staff scheduling, patient records integration, compliance tracking, and seamless HR for healthcare teams.',
  },
  {
    icon: '🏬',
    title: 'Retail & E-commerce',
    desc: 'Multi-location inventory, customer CRM, seasonal analytics, and team management — from one login.',
  },
  {
    icon: '🏗️',
    title: 'Construction & Field Services',
    desc: 'Project staffing, equipment inventory, contractor payroll, and real-time progress dashboards.',
  },
  {
    icon: '💼',
    title: 'Professional Services',
    desc: 'Resource planning, client CRM, billable-hours tracking, and HR — built for agencies and consultancies.',
  },
  {
    icon: '🎓',
    title: 'Education & NGOs',
    desc: 'Manage staff, donors/students, and assets with full audit trails and transparent reporting.',
  },
];

export const Solutions = () => (
  <section className="solutions-section" id="solutions">
    <div className="section-container">
      <div className="section-header">
        <motion.span
          className="label-chip"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Solutions
        </motion.span>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
        >
          Built for every industry.
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Atlas adapts to the way your organisation works, not the other way around.
        </motion.p>
      </div>

      <div className="solutions-grid">
        {SOLUTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            className="solution-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="solution-card__icon">{s.icon}</span>
            <h3 className="solution-card__title">{s.title}</h3>
            <p className="solution-card__desc">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

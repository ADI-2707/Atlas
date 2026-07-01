import { motion } from 'framer-motion';
import { Database, LayoutDashboard, ShieldCheck, Zap } from 'lucide-react';
import './About.css';

const features = [
  {
    icon: <Database size={24} />,
    title: 'Unified Data Core',
    description: 'Break down silos. Your CRM, HR, and Inventory all share a single source of truth.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Lightning Fast',
    description: 'Built on modern architecture. Experience zero-latency navigation and instant data updates.',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Enterprise Security',
    description: 'Multi-tenant architecture with strict access controls and real-time audit logging.',
  },
  {
    icon: <LayoutDashboard size={24} />,
    title: 'Beautiful Interface',
    description: 'A premium, glassmorphism-inspired UI that your employees will actually love using.',
  },
];

export const About = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <motion.div 
          className="about-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">What is Atlas?</h2>
          <p className="section-subtitle">
            Atlas is a complete reimagining of enterprise software. We provide a single, unified platform that replaces dozens of disconnected tools. Manage your customers, employees, products, and insights all from one beautiful dashboard.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="feature-card glass-panel"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

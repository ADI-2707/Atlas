import { motion } from 'framer-motion';
import { ArrowRight, TerminalSquare } from 'lucide-react';
import './Hero.css';

export const Hero = () => {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-content">
        <motion.div 
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="pulse-dot"></span>
          Atlas OS 2.0 is now available
        </motion.div>
        
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          The Operating System for <br />
          <span className="text-gradient-accent">Modern Enterprises</span>
        </motion.h1>

        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Replace your fragmented software stack with one unified, incredibly fast platform. CRM, HR, Inventory, and Analytics seamlessly integrated.
        </motion.p>

        <motion.div 
          className="hero-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button className="btn btn-primary btn-lg">
            Start Free Trial <ArrowRight size={18} />
          </button>
          <button className="btn btn-ghost btn-lg">
            <TerminalSquare size={18} /> Request Demo
          </button>
        </motion.div>
      </div>

      <motion.div 
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="glass-panel app-mockup">
          <div className="mockup-header">
            <div className="traffic-lights">
              <span></span><span></span><span></span>
            </div>
            <div className="mockup-url">atlas-os.app</div>
          </div>
          <div className="mockup-body">
            {/* We will add an actual screenshot or CSS representation here */}
            <div className="mockup-sidebar"></div>
            <div className="mockup-main">
              <div className="mockup-card"></div>
              <div className="mockup-grid">
                <div className="mockup-card"></div>
                <div className="mockup-card"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="glow-orb primary"></div>
        <div className="glow-orb secondary"></div>
      </motion.div>
    </section>
  );
};

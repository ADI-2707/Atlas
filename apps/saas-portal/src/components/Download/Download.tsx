import { motion } from 'framer-motion';
import { Apple, Monitor, Terminal } from 'lucide-react';
import './Download.css';

export const Download = () => {
  return (
    <section className="download-section" id="download">
      <div className="download-container">
        <motion.div 
          className="download-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Available on Every Platform</h2>
          <p className="section-subtitle">
            Whether you are on a Mac, Windows, or Linux, Atlas OS is natively optimized to deliver unparalleled performance.
          </p>
        </motion.div>

        <div className="download-grid">
          <motion.div 
            className="download-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="platform-icon"><Apple size={32} /></div>
            <h3>macOS</h3>
            <p>Apple Silicon & Intel</p>
            <button className="btn btn-primary w-full">Download for Mac</button>
          </motion.div>

          <motion.div 
            className="download-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="platform-icon"><Monitor size={32} /></div>
            <h3>Windows</h3>
            <p>Windows 10 & 11</p>
            <button className="btn btn-primary w-full">Download for Windows</button>
          </motion.div>

          <motion.div 
            className="download-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="platform-icon"><Terminal size={32} /></div>
            <h3>Linux</h3>
            <p>.deb, .rpm, & AppImage</p>
            <button className="btn btn-primary w-full">Download for Linux</button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

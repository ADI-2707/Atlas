import { motion } from 'framer-motion';
import './Solutions.css';

export const Solutions = () => {
  return (
    <section id="solutions" className="solutions-section">
      <div className="container">
        <motion.div
          className="solutions-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="solutions-text">
            <h2>Everything runs in the <span className="highlight">cloud</span>.</h2>
            <p className="subtitle">
              Atlas is a fully managed, browser-based ecosystem. Say goodbye to desktop installations and manual updates.
            </p>

            <ul className="features-list">
              <li>
                <div className="feature-icon">☁️</div>
                <div>
                  <h4>Zero Installation</h4>
                  <p>Access your entire business operating system from any modern web browser securely.</p>
                </div>
              </li>
              <li>
                <div className="feature-icon">🔄</div>
                <div>
                  <h4>Real-Time Sync</h4>
                  <p>Your CRM, HR, and Analytics modules sync instantaneously across all devices globally.</p>
                </div>
              </li>
              <li>
                <div className="feature-icon">🔒</div>
                <div>
                  <h4>Bank-Grade Security</h4>
                  <p>Your organizational data is strictly isolated with enterprise-grade encryption and tenant boundary enforcement.</p>
                </div>
              </li>
            </ul>

            <div className="cta-group">
              <button className="btn btn-primary">Start your web workspace</button>
            </div>
          </div>

          <div className="solutions-visual">
            <div className="cloud-graphic">
              <div className="app-card crm">CRM Module</div>
              <div className="app-card hr">HR Module</div>
              <div className="app-card inventory">Inventory Module</div>
              <div className="app-card analytics">Analytics Engine</div>
              <div className="connection-lines"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

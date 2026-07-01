import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import './Contact.css';

export const Contact = () => {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <motion.div 
          className="contact-info"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Let's talk about your enterprise.</h2>
          <p className="section-subtitle">
            Need a custom deployment? Have questions about security or compliance? Our enterprise architects are ready to help you plan your migration to Atlas.
          </p>

          <div className="contact-methods">
            <div className="contact-method">
              <div className="method-icon"><Mail size={20} /></div>
              <div>
                <h4>Email Us</h4>
                <p>enterprise@atlas-os.app</p>
              </div>
            </div>
            <div className="contact-method">
              <div className="method-icon"><Phone size={20} /></div>
              <div>
                <h4>Call Us</h4>
                <p>+1 (800) 123-4567</p>
              </div>
            </div>
            <div className="contact-method">
              <div className="method-icon"><MessageSquare size={20} /></div>
              <div>
                <h4>Live Chat</h4>
                <p>Available 24/7 for Enterprise customers</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="contact-form-wrapper glass-panel"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Work Email</label>
              <input type="email" placeholder="you@company.com" className="form-input" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" placeholder="John" className="form-input" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" placeholder="Doe" className="form-input" />
              </div>
            </div>
            <div className="form-group">
              <label>Company Size</label>
              <select className="form-input">
                <option>1-50 employees</option>
                <option>51-200 employees</option>
                <option>201-1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
            <div className="form-group">
              <label>How can we help?</label>
              <textarea placeholder="Tell us about your requirements..." className="form-input" rows={4}></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-full">Contact Sales</button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import './Contact.css';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Contact form submitted]', form);
    setSent(true);
  };

  return (
    <section className="contact-section" id="contact">
      <div className="section-container">
        <div className="contact-grid">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="label-chip">Contact Sales</span>
            <h2 className="section-title">Let's talk about<br />your organisation.</h2>
            <p className="section-subtitle" style={{ maxWidth: '100%' }}>
              Whether you need a custom plan, a live demo, or just want to ask questions —
              our team will get back to you within one business day.
            </p>
            <div className="contact-info__details">
              <div className="contact-detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="var(--accent)" strokeWidth="2" />
                  <polyline points="22,6 12,13 2,6" stroke="var(--accent)" strokeWidth="2" />
                </svg>
                <span>sales@atlas.io</span>
              </div>
              <div className="contact-detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
                  <polyline points="12,6 12,12 16,14" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Response within 24 hours</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="contact-form-wrap"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {sent ? (
              <div className="contact-success">
                <div className="contact-success__icon">✓</div>
                <h3>Message received!</h3>
                <p>Our team will reach out to <strong>{form.email}</strong> within one business day.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input id="name" name="name" type="text" required placeholder="Jane Smith" value={form.name} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Work Email</label>
                    <input id="email" name="email" type="email" required placeholder="jane@company.com" value={form.email} onChange={handle} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" type="text" placeholder="Acme Inc." value={form.company} onChange={handle} />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={4} required placeholder="Tell us about your team size and what you're looking for…" value={form.message} onChange={handle} />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Send Message
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

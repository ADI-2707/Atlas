import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const TIERS = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'The unified dashboard and core data infrastructure for small teams.',
    features: ['Up to 25 users', 'Unified data core', 'Role-based access', 'Audit logs', 'Community support'],
    cta: 'Start Free Trial',
    plan: 'starter',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'All plugins included. Built for growing organisations that need everything.',
    features: ['Unlimited users', 'All 5 plugins (CRM, HR, Inventory, Projects, Analytics)', 'Priority support 24/7', 'Custom roles & permissions', 'SSO & advanced security', 'Dedicated onboarding'],
    cta: 'Subscribe Now',
    plan: 'enterprise',
    highlight: true,
  },
  {
    name: 'Custom',
    price: 'Custom',
    period: '',
    description: 'Dedicated infrastructure, custom integrations, and a dedicated solution architect.',
    features: ['Dedicated instance', 'Custom integrations', 'SLA guarantee', 'Dedicated architect', 'On-premise option'],
    cta: 'Contact Sales',
    plan: 'custom',
    highlight: false,
  },
];

const card = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export const Pricing = () => {
  const navigate = useNavigate();

  const handleCta = (tier: typeof TIERS[number]) => {
    if (tier.plan === 'custom') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/signup?plan=${tier.plan}`);
    }
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="section-container">
        <div className="section-header">
          <motion.span
            className="label-chip"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Pricing
          </motion.span>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            Transparent, scalable pricing.
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Start free. No credit card required. Upgrade anytime as your team grows.
          </motion.p>
        </div>

        <div className="pricing-grid">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`pricing-card${tier.highlight ? ' pricing-card--highlight' : ''}`}
              variants={card}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {tier.highlight && <div className="pricing-card__badge">Most Popular</div>}
              <div className="pricing-card__header">
                <h3 className="pricing-card__name">{tier.name}</h3>
                <div className="pricing-card__price-row">
                  <span className="pricing-card__price">{tier.price}</span>
                  {tier.period && <span className="pricing-card__period">{tier.period}</span>}
                </div>
                <p className="pricing-card__desc">{tier.description}</p>
              </div>

              <ul className="pricing-card__features">
                {tier.features.map((f) => (
                  <li key={f}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill={tier.highlight ? '#1a73e820' : '#0a0a0a0d'}/>
                      <path d="M5 8l2 2 4-4" stroke={tier.highlight ? '#1a73e8' : '#0a0a0a'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`btn w-full${tier.highlight ? ' btn-primary' : ' btn-ghost'}`}
                onClick={() => handleCta(tier)}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="pricing-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
};

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import './Pricing.css';

const tiers = [
  {
    name: 'Base OS',
    price: '$49',
    period: '/month',
    description: 'The unified dashboard and core data infrastructure.',
    features: ['Unlimited Users', 'Unified Data Core', 'Role-Based Access', 'Community Support'],
    buttonText: 'Start Free Trial',
    primary: false,
  },
  {
    name: 'Enterprise Bundle',
    price: '$199',
    period: '/month',
    description: 'Includes Base OS plus all premium plugins.',
    features: ['Everything in Base', 'CRM & HR Plugins', 'Inventory Management', 'Advanced Analytics', '24/7 Priority Support'],
    buttonText: 'Subscribe Now',
    primary: true,
  },
  {
    name: 'Custom Deployment',
    price: 'Custom',
    period: '',
    description: 'For large organizations needing custom infrastructure.',
    features: ['Dedicated Instance', 'Custom Integrations', 'SLA Guarantee', 'Dedicated Architect'],
    buttonText: 'Contact Sales',
    primary: false,
  }
];

export const Pricing = () => {
  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">
        <motion.div 
          className="pricing-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Transparent, scalable pricing.</h2>
          <p className="section-subtitle">
            Start with the core OS and add plugins as you grow, or get everything unified in our Enterprise bundle.
          </p>
        </motion.div>

        <div className="pricing-grid">
          {tiers.map((tier, index) => (
            <motion.div 
              key={tier.name}
              className={`pricing-card glass-panel ${tier.primary ? 'primary-tier' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {tier.primary && <div className="popular-badge">Most Popular</div>}
              <h3>{tier.name}</h3>
              <div className="price-container">
                <span className="price">{tier.price}</span>
                <span className="period">{tier.period}</span>
              </div>
              <p className="tier-desc">{tier.description}</p>
              
              <ul className="tier-features">
                {tier.features.map(feature => (
                  <li key={feature}>
                    <Check size={18} className="check-icon" /> {feature}
                  </li>
                ))}
              </ul>
              
              <button className={`btn w-full ${tier.primary ? 'btn-primary' : 'btn-ghost border-btn'}`}>
                {tier.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

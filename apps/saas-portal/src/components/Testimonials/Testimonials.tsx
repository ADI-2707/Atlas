import './Testimonials.css';

const QUOTES = [
  { text: 'Atlas replaced five tools we were paying for separately. The ROI was visible within the first month.', name: 'Sarah Chen', role: 'COO', company: 'NovaTech' },
  { text: "Our HR team used to spend 3 hours a week on manual reports. That's down to zero with Atlas.", name: 'James Okafor', role: 'HR Director', company: 'Meridian Group' },
  { text: 'The inventory module alone paid for itself. We caught a $40k discrepancy in week one.', name: 'Priya Sharma', role: 'Operations Lead', company: 'SupplyCore' },
  { text: "I was skeptical about an all-in-one. But Atlas's plugin model means we only pay for what we use.", name: 'Marco Delgado', role: 'CEO', company: 'BuildFast' },
  { text: 'Onboarding our 200-person team took less than a day. The invite flow is genuinely elegant.', name: 'Lisa Tanaka', role: 'IT Manager', company: 'HorizonEdu' },
  { text: 'The audit logs alone are worth it for our compliance requirements. Full transparency, always.', name: 'Ravi Menon', role: 'CFO', company: 'Finova' },
];

const DOUBLED = [...QUOTES, ...QUOTES];

const initials = (name: string) => name.split(' ').map(n => n[0]).join('');

const AVATAR_COLORS = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9c27b0', '#00bcd4'];

export const Testimonials = () => (
  <section className="testimonials-section" id="testimonials">
    <div className="section-header">
      <span className="label-chip">Testimonials</span>
      <h2 className="section-title">Trusted by teams worldwide.</h2>
    </div>

    <div className="marquee-wrapper">
      <div className="marquee-track" aria-hidden="false">
        {DOUBLED.map((q, i) => (
          <div key={i} className="testimonial-card">
            <p className="testimonial-card__text">"{q.text}"</p>
            <div className="testimonial-card__author">
              <div
                className="testimonial-card__avatar"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {initials(q.name)}
              </div>
              <div>
                <div className="testimonial-card__name">{q.name}</div>
                <div className="testimonial-card__role">{q.role}, {q.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

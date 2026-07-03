import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { CursorDot } from './components/CursorDot/CursorDot';
import { GridBackground } from './components/GridBackground/GridBackground';
import { Hero } from './components/Hero/Hero';
import { About } from './components/About/About';
import { Pricing } from './components/Pricing/Pricing';
import { Solutions } from './components/Solutions/Solutions';
import { Testimonials } from './components/Testimonials/Testimonials';
import { Contact } from './components/Contact/Contact';
import { Signup } from './pages/Signup/Signup';
import './App.css';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="nav-brand" onClick={() => scrollTo('hero')}>
        Atlas<span className="nav-brand__dot">.</span>
      </div>

      <ul className="nav-links">
        <li><button onClick={() => scrollTo('about')}>Platform</button></li>
        <li><button onClick={() => scrollTo('pricing')}>Pricing</button></li>
        <li><button onClick={() => scrollTo('solutions')}>Solutions</button></li>
        <li><button onClick={() => scrollTo('contact')}>Contact</button></li>
      </ul>

      <div className="nav-cta">
        <a href={APP_URL} className="btn btn-ghost btn-sm">Sign In</a>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
          Get Started
        </button>
      </div>
    </nav>
  );
};

const Landing = () => {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <>
      <GridBackground />
      <CursorDot />
      <Navbar />
      <main className="main-content">
        <Hero />
        <About />
        <Pricing />
        <Solutions />
        <Testimonials />
        <Contact />
      </main>
      <footer ref={footerRef} className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">Atlas<span>.</span></span>
          <span className="footer-copy">© {new Date().getFullYear()} Atlas Inc. All rights reserved.</span>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>
      </footer>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={
          <>
            <CursorDot />
            <Signup />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

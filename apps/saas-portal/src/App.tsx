import { useEffect, useState } from 'react';
import { Hero } from './components/Hero';
import './App.css';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand">
          Atlas<span className="dot">.</span>
        </div>
        <div className="nav-links">
          <a href="#hero">Overview</a>
          <a href="#about">Platform</a>
          <a href="#download">Download</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-cta">
          <button className="btn btn-ghost">Sign In</button>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </nav>

      <main className="main-content">
        <Hero />
      </main>
    </div>
  );
}

export default App;

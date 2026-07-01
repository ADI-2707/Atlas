import { useEffect, useState } from 'react';
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
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-cta">
          <button className="btn btn-ghost">Sign In</button>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </nav>

      <main className="main-content">
        {/* Sections will be built here */}
      </main>
    </div>
  );
}

export default App;

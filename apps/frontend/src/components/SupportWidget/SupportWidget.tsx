import React, { useState, useEffect } from 'react';
import { Button } from '@atlas/ui';
import './SupportWidget.css';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
}

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && view === 'LIST') {
      fetchTickets();
    }
  }, [isOpen, view]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/v1/audit/tickets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('atlas_token')}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setTickets(json.data || []);
      }
    } catch (e) {
      console.error('Failed to load tickets', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/v1/audit/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('atlas_token')}`
        },
        body: JSON.stringify({ subject, description })
      });
      
      if (res.ok) {
        setSubject('');
        setDescription('');
        setView('LIST');
      } else {
        alert('Failed to submit ticket');
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-widget-container">
      {isOpen && (
        <div className="support-widget-panel">
          <div className="support-widget-header">
            <h3>Help & Support</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">×</button>
          </div>
          
          <div className="support-widget-body">
            {view === 'LIST' ? (
              <>
                <div className="support-tickets-list">
                  {tickets.length === 0 ? (
                    <p className="no-tickets">You haven't raised any issues yet.</p>
                  ) : (
                    tickets.map(t => (
                      <div key={t.id} className="ticket-item">
                        <div className="ticket-title">{t.subject}</div>
                        <div className={`ticket-status status-${t.status.toLowerCase()}`}>
                          {t.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button 
                  onClick={() => setView('CREATE')} 
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Raise an Issue
                </Button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="support-ticket-form">
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
                <div className="form-actions">
                  <Button variant="secondary" onClick={() => setView('LIST')} type="button">Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Issue'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      <button 
        className="support-widget-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Help & Support"
      >
        ?
      </button>
    </div>
  );
};

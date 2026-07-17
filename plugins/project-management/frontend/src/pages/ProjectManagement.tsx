import React, { useState, useEffect } from 'react';
import { api } from '@atlas/api';
import { Button } from '@atlas/ui';
import { KanbanBoard, Issue } from '../components/KanbanBoard';
import { ProjectModal } from '../components/ProjectModal';
import { IssueModal } from '../components/IssueModal';
import { ProjectActivityLogs } from '../components/ProjectActivityLogs';
import { usePlugins } from '@atlas/core-ui';
import { TimelineView } from '../components/TimelineView';
import { ErrorTrackingView } from '../components/ErrorTrackingView';
import { LineupView } from '../components/LineupView';
import './ProjectManagement.css';

export const ProjectManagement: React.FC = () => {
  const { setWorkspaceLock } = usePlugins();
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeView, setActiveView] = useState<'board' | 'list' | 'logs' | 'timeline' | 'lineups' | 'errors'>('board');
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  
  const [limitStats, setLimitStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      fetchIssues(activeProjectId);
    } else {
      setIssues([]);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (projects.length > 0 && limitStats && activeProjectId) {
      const activeIdx = projects.findIndex(p => p.id === activeProjectId);
      if (limitStats.maxProjects !== -1 && activeIdx >= limitStats.maxProjects) {
        setActiveProjectId(projects[0].id);
      }
    }
  }, [projects, limitStats, activeProjectId]);

  useEffect(() => {
    if (limitStats && activeProjectId) {
      const activeIdx = projects.findIndex(p => p.id === activeProjectId);
      const isProjectLocked = limitStats.maxProjects !== -1 && activeIdx >= limitStats.maxProjects;
      
      const viewLocked = (activeView === 'timeline' && !limitStats.hasTimelines) ||
                         (activeView === 'lineups' && !limitStats.hasCustomLineups) ||
                         (activeView === 'errors' && !limitStats.hasErrorTracking);
      
      if (isProjectLocked) {
        setWorkspaceLock({
          title: "Project Locked",
          description: "This project is locked under your current subscription plan. Please upgrade to a higher tier to access this project.",
          upgradePath: "/store/project-management",
          secondaryAction: {
            label: "Go back to Main Project",
            onClick: () => {
              if (projects.length > 0) setActiveProjectId(projects[0].id);
              setWorkspaceLock(null);
            }
          }
        });
      } else if (viewLocked) {
        let title = "Feature Locked";
        let description = "This feature is not included in your current subscription plan. Please upgrade to a higher tier to access it.";
        
        if (activeView === 'timeline') {
          title = "Timeline Locked";
          description = "Please upgrade to a Professional tier or higher to access timeline views.";
        } else if (activeView === 'lineups') {
          title = "Lineups Locked";
          description = "Please upgrade to a Business tier or higher to create custom workflow stages and allocate resources.";
        } else if (activeView === 'errors') {
          title = "Error Tracking Locked";
          description = "Please upgrade to an Enterprise tier to access automated error tracking ingestion.";
        }

        setWorkspaceLock({
          title,
          description,
          upgradePath: "/store/project-management",
          secondaryAction: {
            label: "Go back to Board",
            onClick: () => {
              setActiveView('board');
              setWorkspaceLock(null);
            }
          }
        });
      } else {
        setWorkspaceLock(null);
      }
    }
    return () => setWorkspaceLock(null);
  }, [limitStats, activeProjectId, projects, setWorkspaceLock, activeView]);

  const fetchStats = async () => {
    try {
      const res = await api.get<any>('/plugins/project-management/stats');
      setLimitStats(res.data);
    } catch (err) {
      console.error('Failed to fetch PM stats', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get<any>('/plugins/project-management/projects');
      const fetchedProjects = res.data || [];
      setProjects(fetchedProjects);
      if (fetchedProjects.length > 0 && !activeProjectId) {
        setActiveProjectId(fetchedProjects[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const fetchIssues = async (projectId: string) => {
    try {
      const res = await api.get<any>(`/plugins/project-management/projects/${projectId}/issues`);
      setIssues(res.data || []);
    } catch (err) {
      console.error('Failed to fetch issues', err);
    }
  };

  const handleCreateProject = async (data: { name: string; key: string; description: string }) => {
    try {
      const res = await api.post<any>('/plugins/project-management/projects', data);
      await fetchProjects();
      setActiveProjectId(res.data?.id);
      fetchStats();
      setIsProjectModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    }
  };

  const handleCreateIssue = async (data: { title: string; priority: string; description: string }) => {
    if (!activeProjectId) return;
    try {
      await api.post('/plugins/project-management/issues', {
        projectId: activeProjectId,
        ...data
      });
      fetchIssues(activeProjectId);
      fetchStats();
      setIsIssueModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create issue');
    }
  };

  const handleIssueMove = async (issueId: string, newStatus: string) => {
    setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, status: newStatus } : issue));
    try {
      await api.put(`/plugins/project-management/issues/${issueId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to move issue', err);
      if (activeProjectId) fetchIssues(activeProjectId); // revert on failure
    }
  };

  const isProjectAddLocked = limitStats && limitStats.maxProjects !== -1 && projects.length >= limitStats.maxProjects;
  const isIssueAddLocked = limitStats && limitStats.maxIssues !== -1 && limitStats.issueCount >= limitStats.maxIssues;

  if (projects.length === 0) {
    return (
      <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-primary)' }}>
        <h2 style={{ marginBottom: '1rem' }}>Welcome to Project Management</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You don't have any projects yet. Create one to get started.</p>
        <Button variant="primary" onClick={() => setIsProjectModalOpen(true)}>Create First Project</Button>
        {isProjectModalOpen && <ProjectModal onClose={() => setIsProjectModalOpen(false)} onSubmit={handleCreateProject} />}
      </div>
    );
  }

  return (
    <div className="project-management-dashboard" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="dashboard-header-container" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', padding: '1.5rem 2rem 0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="clean-tabs-bar" style={{ display: 'flex', gap: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveView('board')}
              className={`clean-tab-btn ${activeView === 'board' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeView === 'board' ? '2px solid var(--color-accent-pm)' : '2px solid transparent',
                color: activeView === 'board' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: activeView === 'board' ? '600' : '500',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className={`clean-tab-btn ${activeView === 'list' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeView === 'list' ? '2px solid var(--color-accent-pm)' : '2px solid transparent',
                color: activeView === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: activeView === 'list' ? '600' : '500',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setActiveView('logs')}
              className={`clean-tab-btn ${activeView === 'logs' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeView === 'logs' ? '2px solid var(--color-accent-pm)' : '2px solid transparent',
                color: activeView === 'logs' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: activeView === 'logs' ? '600' : '500',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Logs
            </button>
            <button
              type="button"
              onClick={() => setActiveView('timeline')}
              className={`clean-tab-btn ${activeView === 'timeline' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeView === 'timeline' ? '2px solid var(--color-accent-pm)' : '2px solid transparent',
                color: activeView === 'timeline' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: activeView === 'timeline' ? '600' : '500',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setActiveView('lineups')}
              className={`clean-tab-btn ${activeView === 'lineups' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeView === 'lineups' ? '2px solid var(--color-accent-pm)' : '2px solid transparent',
                color: activeView === 'lineups' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: activeView === 'lineups' ? '600' : '500',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Lineups
            </button>
            <button
              type="button"
              onClick={() => setActiveView('errors')}
              className={`clean-tab-btn ${activeView === 'errors' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeView === 'errors' ? '2px solid var(--color-accent-pm)' : '2px solid transparent',
                color: activeView === 'errors' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: activeView === 'errors' ? '600' : '500',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Errors
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="table-selector-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Project:</span>
              <select
                value={activeProjectId || ''}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    if (isProjectAddLocked) {
                      alert("Project limit reached. Upgrade to create more projects.");
                    } else {
                      setIsProjectModalOpen(true);
                    }
                    return;
                  }
                  setActiveProjectId(e.target.value);
                }}
                className="atlas-input"
                style={{ minWidth: '160px', padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
              >
                {projects.map((proj, idx) => {
                  const maxProj = limitStats?.maxProjects || 1;
                  const isLocked = maxProj !== -1 && idx >= maxProj;
                  return (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} {isLocked ? '(Locked 🔒)' : ''}
                    </option>
                  );
                })}
                <option value="__new__">+ Create New Project...</option>
              </select>
            </div>
            
            <Button
              variant="primary"
              size="small"
              disabled={isIssueAddLocked}
              onClick={() => setIsIssueModalOpen(true)}
              title={isIssueAddLocked ? "Issue limit reached. Upgrade plan to create more." : ""}
              style={{ backgroundColor: 'var(--color-accent-pm)', borderColor: 'var(--color-accent-pm)', color: '#000' }}
            >
              + New Issue
            </Button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 2rem 2rem 2rem', overflowY: 'auto' }}>
        {activeView === 'board' && (
          <KanbanBoard issues={issues} onIssueMove={handleIssueMove} />
        )}
        {activeView === 'list' && (
          <div className="table-container">
            <table className="atlas-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No issues found in this project.</td>
                  </tr>
                ) : (
                  issues.map(issue => {
                    const proj = projects.find(p => p.id === activeProjectId);
                    const key = proj ? `${proj.key}-${issue.id.substring(0, 4).toUpperCase()}` : issue.id.substring(0, 8);
                    return (
                      <tr key={issue.id}>
                        <td style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{key}</td>
                        <td>{issue.title}</td>
                        <td>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            backgroundColor: issue.status === 'DONE' ? '#10b98120' : issue.status === 'IN_PROGRESS' ? '#3b82f620' : '#6b728020',
                            color: issue.status === 'DONE' ? '#10b981' : issue.status === 'IN_PROGRESS' ? '#3b82f6' : '#6b7280'
                          }}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            color: issue.priority === 'HIGH' ? '#ef4444' : issue.priority === 'MEDIUM' ? '#f59e0b' : '#3b82f6'
                          }}>
                            {issue.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeView === 'logs' && (
          <ProjectActivityLogs />
        )}
        {activeView === 'timeline' && activeProjectId && (
          limitStats?.hasTimelines && <TimelineView issues={issues} />
        )}
        {activeView === 'lineups' && activeProjectId && (
          limitStats?.hasCustomLineups && <LineupView projectId={activeProjectId} />
        )}
        {activeView === 'errors' && activeProjectId && (
          limitStats?.hasErrorTracking && <ErrorTrackingView projectId={activeProjectId} />
        )}
      </div>

      {isProjectModalOpen && <ProjectModal onClose={() => setIsProjectModalOpen(false)} onSubmit={handleCreateProject} />}
      {isIssueModalOpen && <IssueModal onClose={() => setIsIssueModalOpen(false)} onSubmit={handleCreateIssue} />}
    </div>
  );
};

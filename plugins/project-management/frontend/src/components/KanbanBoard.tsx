import React, { useState, useRef } from 'react';
import './KanbanBoard.css';

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface Column {
  id: string;
  title: string;
}

const initialIssues: Issue[] = [
  { id: '1', title: 'Setup database schema', status: 'TODO', priority: 'HIGH' },
  { id: '2', title: 'Implement Auth APIs', status: 'IN_PROGRESS', priority: 'MEDIUM' },
  { id: '3', title: 'Design landing page', status: 'DONE', priority: 'LOW' },
];

const columns: Column[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export const KanbanBoard: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const dragOverColumnId = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedIssueId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);

    setTimeout(() => {
      const el = document.getElementById(`issue-${id}`);
      if (el) el.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setDraggedIssueId(null);
    const el = document.getElementById(`issue-${id}`);
    if (el) el.classList.remove('dragging');

    document.querySelectorAll('.kanban-column-content').forEach(el => el.classList.remove('drag-over'));
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (dragOverColumnId.current !== columnId) {
      dragOverColumnId.current = columnId;
    }
  };

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const el = document.getElementById(`column-${columnId}`);
    if (el) el.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const el = document.getElementById(`column-${columnId}`);
    if (el) el.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const el = document.getElementById(`column-${columnId}`);
    if (el) el.classList.remove('drag-over');

    const issueId = e.dataTransfer.getData('text/plain');
    if (issueId && draggedIssueId) {
      setIssues(prev =>
        prev.map(issue =>
          issue.id === issueId ? { ...issue, status: columnId } : issue
        )
      );
    }
    setDraggedIssueId(null);
  };

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <div key={column.id} className="kanban-column">
          <div className="kanban-column-header">
            <span>{column.title}</span>
            <span className="kanban-card-badge">{issues.filter(i => i.status === column.id).length}</span>
          </div>
          <div
            id={`column-${column.id}`}
            className="kanban-column-content"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragEnter={(e) => handleDragEnter(e, column.id)}
            onDragLeave={(e) => handleDragLeave(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {issues.filter(i => i.status === column.id).map(issue => (
              <div
                key={issue.id}
                id={`issue-${issue.id}`}
                className="kanban-card"
                draggable
                onDragStart={(e) => handleDragStart(e, issue.id)}
                onDragEnd={(e) => handleDragEnd(e, issue.id)}
              >
                <div className="kanban-card-title">{issue.title}</div>
                <div className="kanban-card-meta">
                  <span>{issue.id}</span>
                  <span className="kanban-card-badge" style={{
                    backgroundColor: issue.priority === 'HIGH' ? '#ef4444' :
                      issue.priority === 'MEDIUM' ? '#f59e0b' : '#3b82f6'
                  }}>
                    {issue.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

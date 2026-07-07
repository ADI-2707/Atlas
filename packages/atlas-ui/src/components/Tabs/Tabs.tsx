import React from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  accentColor?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeId, onChange, accentColor }) => {
  return (
    <div className="clean-tabs-bar">
      {tabs.map(tab => {
        const isActive = activeId === tab.id;
        const activeStyle = isActive && accentColor ? { 
          color: accentColor, 
          borderBottomColor: accentColor 
        } : {};
        
        return (
          <button
            key={tab.id}
            type="button"
            className={`clean-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
            style={activeStyle}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

import React, { HTMLAttributes } from 'react';
import './Sidebar.css';

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  isCollapsed?: boolean;
  onToggle?: () => void;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggle,
  logo = 'Atlas',
  footer,
  children,
  className = '',
  ...props
}) => {
  const classes = ['atlas-sidebar', isCollapsed ? 'atlas-sidebar--collapsed' : '', className].filter(Boolean).join(' ');

  return (
    <aside className={classes} {...props}>
      <div className="atlas-sidebar-header">
        <div className="atlas-sidebar-logo">{logo}</div>
        {onToggle && (
          <button className="atlas-sidebar-toggle" onClick={onToggle} aria-label="Toggle Sidebar">
            {isCollapsed ? '→' : '←'}
          </button>
        )}
      </div>
      <nav className="atlas-sidebar-nav">
        {children}
      </nav>
      {footer && (
        <div className="atlas-sidebar-footer">
          {footer}
        </div>
      )}
    </aside>
  );
};

export interface SidebarItemProps extends HTMLAttributes<HTMLAnchorElement | HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  as?: React.ElementType;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive,
  href,
  as: Component = 'a',
  className = '',
  ...props
}) => {
  const classes = ['atlas-sidebar-item', isActive ? 'atlas-sidebar-item--active' : '', className].filter(Boolean).join(' ');

  if (href) {
    return (
      <a href={href} className={classes} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {icon && <span className="atlas-sidebar-icon">{icon}</span>}
        <span className="atlas-sidebar-label">{label}</span>
      </a>
    );
  }

  return (
    <div className={classes} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
      {icon && <span className="atlas-sidebar-icon">{icon}</span>}
      <span className="atlas-sidebar-label">{label}</span>
    </div>
  );
};

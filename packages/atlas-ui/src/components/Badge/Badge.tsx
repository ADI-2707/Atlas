import React, { HTMLAttributes } from 'react';
import './Badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const classes = ['atlas-badge', `atlas-badge--${variant}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

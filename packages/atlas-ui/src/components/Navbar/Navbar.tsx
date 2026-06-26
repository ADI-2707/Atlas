import React, { HTMLAttributes } from 'react';
import './Navbar.css';

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  leftContent,
  rightContent,
  children,
  className = '',
  ...props
}) => {
  return (
    <header className={`atlas-navbar ${className}`} {...props}>
      <div className="atlas-navbar-left">
        {leftContent}
        {children}
      </div>
      {rightContent && (
        <div className="atlas-navbar-right">
          {rightContent}
        </div>
      )}
    </header>
  );
};

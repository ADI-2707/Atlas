import React, { HTMLAttributes } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`atlas-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`atlas-card-header ${className}`} {...props}>{children}</div>
);

export const CardBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`atlas-card-body ${className}`} {...props}>{children}</div>
);

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`atlas-card-footer ${className}`} {...props}>{children}</div>
);

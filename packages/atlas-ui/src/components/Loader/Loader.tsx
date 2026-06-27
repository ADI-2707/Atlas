import React, { HTMLAttributes } from 'react';
import './Loader.css';

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large';
}

export const Loader: React.FC<LoaderProps> = ({ size = 'medium', className = '', ...props }) => {
  const classes = ['atlas-loader', `atlas-loader--${size}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" aria-label="Loading" {...props} />
  );
};

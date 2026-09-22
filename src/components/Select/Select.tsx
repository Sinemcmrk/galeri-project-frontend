'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
  /** Inline style on the wrapper div — use for one-off sizing (e.g. width:
   *  auto in a flex row) since it always wins, unlike cross-module CSS
   *  cascade order which is not guaranteed between separate .module.css files. */
  wrapperStyle?: React.CSSProperties;
};

// A visual wrapper around the native <select> element: keeps full native
// accessibility, keyboard navigation and mobile support, but replaces the
// browser's default arrow with a themed chevron and gives the closed state a
// consistent, modern look across the app.
export default function Select({ className, wrapperClassName, wrapperStyle, children, ...props }: SelectProps) {
  return (
    <div className={`${styles.wrapper} ${wrapperClassName ?? ''}`} style={wrapperStyle}>
      <select className={`${styles.select} ${className ?? ''}`} {...props}>
        {children}
      </select>
      <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
    </div>
  );
}

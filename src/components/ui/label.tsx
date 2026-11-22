'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

/**
 * Formats label children so that any asterisk ('*') is rendered in vibrant red
 * with proper spacing, matching the user requirement: "* will be red".
 */
function renderLabelWithRedAsterisk(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string') {
    if (node.includes('*')) {
      const parts = node.split('*');
      return (
        <>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && (
                <span className="text-red-500 font-bold ml-1 select-none" aria-hidden="true">*</span>
              )}
            </React.Fragment>
          ))}
        </>
      );
    }
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((child, idx) => (
      <React.Fragment key={idx}>{renderLabelWithRedAsterisk(child)}</React.Fragment>
    ));
  }
  return node;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-xs font-semibold text-foreground leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none inline-flex items-center gap-1 mb-2',
          className
        )}
        {...props}
      >
        <span>{renderLabelWithRedAsterisk(children)}</span>
        {required && <span className="text-red-500 font-bold ml-1 select-none" aria-hidden="true">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';

export { Label };
export default Label;

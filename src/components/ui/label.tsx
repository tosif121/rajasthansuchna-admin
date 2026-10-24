'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-xs font-semibold text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none inline-flex items-center gap-1.5',
          className
        )}
        {...props}
      >
        {React.isValidElement(children) ? children : (
          <span>{children}</span>
        )}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';

export { Label };
export default Label;

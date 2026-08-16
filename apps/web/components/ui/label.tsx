import { type LabelHTMLAttributes } from 'react';
import { cn } from '@deutschflow/ui';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium', className)} {...props} />;
}

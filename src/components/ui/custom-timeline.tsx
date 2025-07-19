'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'destructive';
}

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative space-y-8', className)}
      {...props}
    >
      {children}
    </div>
  )
);
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative pl-8', className)}
      {...props}
    >
      <div className="absolute left-4 top-1 h-full w-px bg-border" />
      {children}
    </div>
  )
);
TimelineItem.displayName = 'TimelineItem';

const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('absolute left-0 top-0 flex h-4 w-4 items-center justify-center', className)}
      {...props}
    />
  )
);
TimelineSeparator.displayName = 'TimelineSeparator';

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-border',
      primary: 'bg-primary',
      success: 'bg-green-500',
      destructive: 'bg-destructive',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'h-3 w-3 rounded-full border-2 border-background',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
TimelineDot.displayName = 'TimelineDot';

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pb-8 pl-4', className)}
      {...props}
    />
  )
);
TimelineContent.displayName = 'TimelineContent';

export { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineContent };
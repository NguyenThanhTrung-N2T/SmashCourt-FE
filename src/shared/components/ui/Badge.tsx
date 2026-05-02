import { ReactNode } from'react';

interface BadgeProps {
 children: ReactNode;
 variant?:'success' |'warning' |'error' |'info' |'neutral';
 size?:'sm' |'md';
 className?: string;
 icon?: ReactNode;
 dot?: boolean;
}

export function Badge({
 children,
 variant ='neutral',
 size ='md',
 className ='',
 icon,
 dot = false,
}: BadgeProps) {
 const baseStyles ='inline-flex items-center gap-1 rounded-full font-bold';
 
 const sizeStyles = {
 sm:'px-2 py-0.5 text-[10px]',
 md:'px-2 py-1 text-xs',
 };
 
 const variantStyles = {
 success:'bg-primary/10 text-primary',
 warning:'bg-amber-500/15 text-amber-600',
 error:'bg-red-500/15 text-red-600',
 info:'bg-blue-500/15 text-blue-600',
 neutral:'bg-surface-2 text-muted',
 };

 const dotStyles = {
 success:'bg-[#2A9D5C]',
 warning:'bg-amber-500',
 error:'bg-red-500',
 info:'bg-blue-500',
 neutral:'bg-muted',
 };

 return (
 <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
 {dot && (
 <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />
 )}
 {icon && <span className="inline-flex items-center">{icon}</span>}
 {children}
 </span>
 );
}

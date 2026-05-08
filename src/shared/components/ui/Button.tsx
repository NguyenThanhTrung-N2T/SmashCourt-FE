import { ReactNode, forwardRef } from'react';
import { CircleNotch } from'@phosphor-icons/react';

interface ButtonProps {
 children: ReactNode;
 onClick?: () => void;
 disabled?: boolean;
 variant?:'primary' |'secondary' |'danger' |'ghost' |'dangerSoft' |'success';
 size?:'sm' |'md' |'lg';
 className?: string;
 type?:'button' |'submit' |'reset';
 leftIcon?: ReactNode;
 isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
 children,
 onClick,
 disabled = false,
 variant ='primary',
 size ='md',
 className ='',
 type ='button',
 leftIcon,
 isLoading = false,
}, ref) {
 const baseStyles ='inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
 
 const sizeStyles = {
 sm:'px-3 py-1.5 text-xs',
 md:'px-5 py-2.5 text-sm',
 lg:'px-6 py-3 text-base',
 };
 
 const variantStyles = {
 primary:'text-white shadow-md hover:opacity-90',
 secondary:'border border-border bg-surface-1 text-foreground shadow-sm hover:bg-surface-2',
 danger:'border border-red-500/40 bg-surface-1 text-red-500 shadow-sm hover:bg-red-500/10',
 dangerSoft:'bg-red-500/10 text-red-500 hover:bg-red-500/15',
 ghost:'text-muted hover:bg-surface-2',
 success:'border border-emerald-500/40 bg-surface-1 text-emerald-500 shadow-sm hover:bg-emerald-500/10',
 };
 
 const gradientStyle = variant ==='primary' ? {
 background:"linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
 boxShadow:"0 4px 14px rgba(27, 94, 56, 0.35)",
 } : undefined;

 return (
 <button
 ref={ref}
 type={type}
 onClick={onClick}
 disabled={disabled || isLoading}
 className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
 style={gradientStyle}
 >
 {isLoading ? (
 <CircleNotch className="h-4 w-4 animate-spin" />
 ) : leftIcon}
 {children}
 </button>
 );
});

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
    children: React.ReactNode;
}

/**
 * A simple Portal component that renders its children into a 
 * div appended to the document body. 
 * This is useful for Modals, Tooltips, and other components 
 * that need to break out of their parent container (e.g. to avoid
 * being clipped by overflow:hidden or restricted by transforms).
 */
export function Portal({ children }: PortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);
        return () => {
            clearTimeout(timer);
            setMounted(false);
        };
    }, []);

    // Avoid SSR issues by only rendering on the client
    if (!mounted) return null;

    return createPortal(children, document.body);
}

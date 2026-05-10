"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/src/shared/utils/cn";

interface SmartImageProps extends Omit<ImageProps, "onLoad"> {
    /** Custom fallback background color class (default: bg-surface-2) */
    fallbackBg?: string;
    /** If true, shows a skeleton pulse effect while loading (default: true) */
    pulse?: boolean;
}

export function SmartImage({
    className,
    fallbackBg = "bg-slate-200 dark:bg-slate-800",
    pulse = true,
    alt,
    ...props
}: SmartImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Image
            alt={alt || ""}
            className={cn(
                "transition-all duration-500",
                isLoading ? "scale-[1.02] blur-sm grayscale" : "scale-100 blur-0 grayscale-0",
                isLoading && pulse ? "animate-pulse" : "",
                isLoading ? fallbackBg : "",
                className
            )}
            onLoad={() => setIsLoading(false)}
            {...props}
        />
    );
}

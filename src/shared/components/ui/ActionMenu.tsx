"use client";

import { useState, useRef, useEffect } from "react";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "success" | "danger";
  hidden?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  size?: "sm" | "md";
  trigger?: React.ReactNode;
}

export function ActionMenu({ items, size = "sm", trigger }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, right: "auto" });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calculate position when menu opens
  useEffect(() => {
    if (isOpen) {
      const element = trigger ? triggerRef.current : buttonRef.current;
      if (!element) return;
      
      const buttonRect = element.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 200; // Approximate
      
      let top = buttonRect.bottom + 4;
      let left = buttonRect.right - menuWidth;
      
      // Check if menu would go below viewport
      if (top + menuHeight > window.innerHeight) {
        top = buttonRect.top - menuHeight - 4;
      }
      
      // Check if menu would go off left edge
      if (left < 8) {
        left = 8;
      }
      
      // Check if menu would go off right edge
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      setMenuPosition({ top, left, right: "auto" });
    }
  }, [isOpen, trigger]);

  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) return null;

  const getItemStyles = (variant?: "default" | "success" | "danger") => {
    switch (variant) {
      case "success":
        return "text-emerald-600 hover:bg-emerald-500/10";
      case "danger":
        return "text-red-600 hover:bg-red-500/10";
      default:
        return "text-foreground hover:bg-surface-2";
    }
  };

  return (
    <>
      {trigger ? (
        <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
      ) : (
        <Button
          ref={buttonRef}
          variant="secondary"
          size={size}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Thao tác"
          aria-expanded={isOpen}
        >
          <DotsThreeVertical className="h-5 w-5" weight="bold" />
        </Button>
      )}

      {isOpen && typeof window !== "undefined" && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div 
            ref={menuRef}
            className="fixed z-[9999] min-w-[200px] rounded-xl border border-border bg-surface-1 shadow-xl py-1"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            {visibleItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors flex items-center gap-3 ${getItemStyles(item.variant)}`}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

import React, { useRef, useEffect, ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Sheet Context
type SheetContextType = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextType | undefined>(undefined);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within a Sheet component');
  }
  return context;
}

// Sheet
interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  };

  return (
    <SheetContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

// Sheet Trigger
interface SheetTriggerProps {
  children: ReactNode;
}

export function SheetTrigger({ children }: SheetTriggerProps) {
  const { onOpenChange } = useSheetContext();

  return (
    <div onClick={() => onOpenChange(true)}>
      {children}
    </div>
  );
}

// Sheet Content
interface SheetContentProps {
  children: ReactNode;
  className?: string;
}

export function SheetContent({ children, className }: SheetContentProps) {
  const { open, onOpenChange } = useSheetContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50">
      <div 
        ref={ref}
        className={cn(
          "fixed right-0 top-0 h-full w-[350px] bg-white p-6 shadow-lg transform transition-transform duration-300 z-50",
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

// Sheet Header
interface SheetHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

// Sheet Title
interface SheetTitleProps {
  children: ReactNode;
  className?: string;
}

export function SheetTitle({ children, className }: SheetTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  );
}

// Sheet Description
interface SheetDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function SheetDescription({ children, className }: SheetDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-500", className)}>
      {children}
    </p>
  );
} 
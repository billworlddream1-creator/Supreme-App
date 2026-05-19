import React from 'react';
import { motion } from 'motion/react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardWidgetProps {
  id: string;
  children: React.ReactNode;
  title?: string;
  isEditing: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveLeft?: () => void; // Move to main column
  onMoveRight?: () => void; // Move to side column
  onRemove: () => void;
  className?: string;
}

export default function DashboardWidget({
  id,
  children,
  title,
  isEditing,
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onRemove,
  className
}: DashboardWidgetProps) {
  return (
    <motion.div
      layoutId={id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "relative group rounded-2xl transition-all duration-200",
        isEditing ? "ring-2 ring-dashed ring-gray-300 hover:ring-[var(--color-supreme-gold)] bg-gray-50/50 p-2" : "",
        className
      )}
    >
      {isEditing && (
        <div className="absolute -top-3 -right-3 z-20 flex gap-1 bg-white rounded-full shadow-md border border-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onMoveLeft && (
            <button onClick={onMoveLeft} className="p-1 hover:bg-gray-100 rounded-full text-gray-500" title="Move Left">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {onMoveUp && (
            <button onClick={onMoveUp} className="p-1 hover:bg-gray-100 rounded-full text-gray-500" title="Move Up">
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} className="p-1 hover:bg-gray-100 rounded-full text-gray-500" title="Move Down">
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
          {onMoveRight && (
            <button onClick={onMoveRight} className="p-1 hover:bg-gray-100 rounded-full text-gray-500" title="Move Right">
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <div className="w-px h-4 bg-gray-200 mx-1 self-center" />
          <button onClick={onRemove} className="p-1 hover:bg-red-50 text-red-500 rounded-full" title="Remove Widget">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {isEditing && (
        <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-400">
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      <div className={clsx("h-full", isEditing && "pointer-events-none select-none opacity-80 blur-[1px]")}>
        {children}
      </div>
    </motion.div>
  );
}

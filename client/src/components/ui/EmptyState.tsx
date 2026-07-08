import React from 'react';
import { motion } from 'framer-motion';
import { Home, PartyPopper, CircleCheck, Banknote, Search, ClipboardList, Megaphone, Wrench as WrenchIcon, Package, Users as UsersIcon } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  '🏠': Home,
  '🎉': PartyPopper,
  '✅': CircleCheck,
  '💸': Banknote,
  '📋': ClipboardList,
  '👥': UsersIcon,
  '📌': Megaphone,
  '🔧': WrenchIcon,
  '📦': Package,
  '🧹': Search,
  '📜': ClipboardList,
}

export interface EmptyStateProps {
  readonly icon?: string | React.ElementType;
  readonly title: string;
  readonly description?: string;
  readonly className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  const IconComponent = typeof icon === 'string' ? ICON_MAP[icon] : icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`text-center py-16 px-6 ${className}`}
    >
      {IconComponent ? (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shadow-sm"
        >
          <IconComponent size={24} className="text-on-surface-variant" />
        </motion.div>
      ) : icon ? (
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shadow-sm">
          <span className="text-2xl text-on-surface-variant">{icon}</span>
        </div>
      ) : null}
      <h3 className="font-display text-[24px] text-white font-medium mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="font-label-caps text-[12px] uppercase tracking-[0.1em] text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default EmptyState;

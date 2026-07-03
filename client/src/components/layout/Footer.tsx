import React from 'react'

export interface FooterProps {
  readonly className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`w-full py-12 px-6 md:px-[64px] flex flex-col md:flex-row justify-between items-center gap-8 bg-transparent border-t border-glass-border mt-auto ${className}`}>
      <div className="font-display text-[20px] font-bold tracking-tight text-white">RoomIQ<span className="text-gradient">.</span></div>
      <div className="flex gap-8">
        <a className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all" href="#">Privacy Policy</a>
        <a className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all" href="#">Terms of Service</a>
        <a className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all" href="#">Contact</a>
      </div>
      <div className="font-label-caps text-[11px] uppercase tracking-[0.15em] text-primary-muted opacity-60">
        © 2024 RoomIQ. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer

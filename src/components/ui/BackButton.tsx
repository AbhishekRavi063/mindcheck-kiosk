import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  isDarkMode?: boolean;
  className?: string;
}

export function BackButton({ onClick, isDarkMode = false, className = '' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
    </button>
  );
}

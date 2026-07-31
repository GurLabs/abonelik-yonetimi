import React from 'react';
import { Github, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  isOledDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isOledDark }) => {
  return (
    <footer className={`border-t py-6 transition-colors ${
      isOledDark 
        ? 'bg-black border-zinc-800 text-zinc-400' 
        : 'bg-white border-gray-200 text-gray-600'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
        {/* Powered By GurLabs */}
        <div className="flex items-center gap-2">
          <span>Powered By</span>
          <a
            href="https://gurlabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-500 hover:text-emerald-400 transition-colors underline decoration-emerald-500/40 underline-offset-4"
          >
            GurLabs
          </a>
        </div>

        {/* Badges: %100 Ai & FREE FOREVER */}
        <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
          <span className="inline-flex items-center gap-1 opacity-75">
            <Sparkles className="w-3 h-3 text-purple-400/80" />
            %100 Ai
          </span>
          <span>•</span>
          <span className="opacity-75">
            FREE FOREVER
          </span>
        </div>

        {/* Github Link */}
        <a
          href="https://github.com/GurLabs/abonelik-yonetimi.git"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
            isOledDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              : 'bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub Repository</span>
        </a>
      </div>
    </footer>
  );
};

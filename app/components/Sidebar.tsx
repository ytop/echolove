import React from 'react';

interface SidebarProps {
  samplesCount: number;
  onOpenDonation: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ samplesCount, onOpenDonation }) => {
  return (
    <div className="hidden md:flex w-20 bg-[#FAF8F3] flex-col items-center py-8 gap-10 border-r border-[#F2EEE6]">
      <div className="text-[#9E8A6B] text-2xl font-bold italic tracking-tighter">
        HH
      </div>
      
      <nav className="flex-1 flex flex-col gap-8 text-[#BDB2A3]">
        <button className="hover:text-[#9E8A6B] transition-colors flex flex-col items-center gap-1 group">
          <i className="fa-solid fa-comment-dots text-xl"></i>
          <span className="text-[10px] font-bold uppercase group-hover:opacity-100 opacity-60 tracking-wider">Chat</span>
        </button>
        <button className="hover:text-[#9E8A6B] transition-colors flex flex-col items-center gap-1 group relative">
          <i className="fa-solid fa-microphone-lines text-xl"></i>
          <span className="text-[10px] font-bold uppercase group-hover:opacity-100 opacity-60 tracking-wider">Voice</span>
          {samplesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#C9B081] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#FAF8F3]">
              {samplesCount}
            </span>
          )}
        </button>
      </nav>

      <button 
        onClick={onOpenDonation}
        className="w-12 h-12 bg-white rounded-2xl hover:bg-[#FFFCEB] transition-all duration-300 flex items-center justify-center text-[#C9B081] shadow-sm border border-[#F2EEE6]"
        title="Support HeartToHeart"
      >
        <i className="fa-solid fa-heart"></i>
      </button>
    </div>
  );
};

export default Sidebar;
